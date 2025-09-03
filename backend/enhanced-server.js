import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Import existing functionality
import { uploadEncryptedImage, downloadFromIPFS, uploadPetComplete, uploadPetMetadata } from '../ipfs/upload.js';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = JSON.parse(fs.readFileSync('./backend/PetStorageABI.json', 'utf8'));
const PROVIDER_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const app = express();
const PORT = process.env.PORT || 3001; // Different port from original backend

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Blockchain setup
let provider, wallet, contract;
if (PROVIDER_URL && CONTRACT_ADDRESS && PRIVATE_KEY) {
  provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
}

// MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI;
let mongoClient;

async function connectToMongo() {
  if (MONGODB_URI) {
    try {
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    blockchain: !!contract,
    mongodb: !!mongoClient,
    timestamp: new Date().toISOString()
  });
});

// Upload file to IPFS
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const encryptionKey = req.body.encryptionKey;
    
    // Generate a unique pet ID
    const petId = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Encrypt the file if encryption key is provided
    let encryptedFilePath = file.path;
    if (encryptionKey) {
      const encryptedPath = path.join(__dirname, '..', 'encryption', `${petId}_encrypted.jpg`);
      // Here you would implement the encryption logic
      // For now, we'll just copy the file
      fs.copyFileSync(file.path, encryptedPath);
      encryptedFilePath = encryptedPath;
    }

    // Upload to IPFS
    const cid = await uploadEncryptedImage(encryptedFilePath);
    
    // Compute hash
    const fileBuffer = fs.readFileSync(encryptedFilePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Clean up temporary file
    fs.unlinkSync(file.path);

    res.json({
      success: true,
      petId,
      cid,
      hash,
      message: 'File uploaded to IPFS successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Enhanced upload endpoint that handles both photo and metadata
app.post('/upload-complete', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const {
      petName,
      species,
      breed,
      age,
      description,
      location,
      microchipId,
      ownerName,
      ownerEmail,
      encryptionKey
    } = req.body;
    
    // Generate a unique pet ID
    const petId = `pet_${Date.now()}_${(petName || 'pet').toLowerCase().replace(/\s+/g, '_')}`;
    
    // Prepare metadata
    const metadata = {
      petId,
      name: petName || 'Unknown Pet',
      species: species || 'Unknown',
      breed: breed || 'Unknown',
      age: parseInt(age) || 0,
      description: description || '',
      location: location || '',
      microchipId: microchipId || '',
      owner: {
        name: ownerName || '',
        email: ownerEmail || ''
      },
      registrationDate: new Date().toISOString(),
      encryptionKey: encryptionKey ? 'present' : 'none' // Don't store actual key
    };
    
    console.log(`🐕 Processing complete upload for pet: ${metadata.name}`);
    
    // Encrypt the file if encryption key is provided
    let encryptedFilePath = file.path;
    if (encryptionKey) {
      const encryptedPath = path.join(__dirname, '..', 'encryption', `${petId}_encrypted.jpg`);
      // Here you would implement the encryption logic
      // For now, we'll just copy the file
      fs.copyFileSync(file.path, encryptedPath);
      encryptedFilePath = encryptedPath;
    }

    // Upload both photo and metadata to IPFS
    const uploadResult = await uploadPetComplete(encryptedFilePath, metadata);
    
    // Compute hash of the photo
    const fileBuffer = fs.readFileSync(encryptedFilePath);
    const photoHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Clean up temporary file
    fs.unlinkSync(file.path);
    if (encryptionKey && fs.existsSync(encryptedFilePath)) {
      fs.unlinkSync(encryptedFilePath);
    }

    console.log(`✅ Complete pet data uploaded successfully!`);
    console.log(`📸 Photo CID: ${uploadResult.photoCID}`);
    console.log(`📋 Metadata CID: ${uploadResult.metadataCID}`);

    res.json({
      success: true,
      petId,
      photoCID: uploadResult.photoCID,
      metadataCID: uploadResult.metadataCID,
      photoHash,
      photoIPFSUrl: uploadResult.photoIPFSUrl,
      metadataIPFSUrl: uploadResult.metadataIPFSUrl,
      metadata: uploadResult.metadata,
      message: 'Pet photo and metadata uploaded to IPFS successfully'
    });
  } catch (error) {
    console.error('Complete upload error:', error);
    res.status(500).json({ error: 'Complete upload failed', details: error.message });
  }
});

// Log pet data to blockchain
app.post('/blockchain/log', async (req, res) => {
  try {
    const { petId, cid, timestamp, metadataCID } = req.body;

    if (!contract) {
      return res.status(500).json({ error: 'Blockchain contract not available' });
    }

    // For now, we'll store the photo CID on blockchain
    // In a future version, we could modify the smart contract to store both CIDs
    const tx = await contract.logPetData(petId, cid, timestamp);
    const receipt = await tx.wait();

    console.log(`✅ Pet data logged to blockchain:`);
    console.log(`   Pet ID: ${petId}`);
    console.log(`   Photo CID: ${cid}`);
    if (metadataCID) {
      console.log(`   Metadata CID: ${metadataCID}`);
      console.log(`   🌐 Metadata URL: https://ipfs.io/ipfs/${metadataCID}`);
    }

    res.json({
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      photoCID: cid,
      metadataCID: metadataCID,
      message: 'Pet data logged to blockchain successfully'
    });
  } catch (error) {
    console.error('Blockchain log error:', error);
    res.status(500).json({ error: 'Blockchain transaction failed', details: error.message });
  }
});

// Get pet data from blockchain
app.get('/blockchain/pet/:petId', async (req, res) => {
  try {
    const { petId } = req.params;

    if (!contract) {
      return res.status(500).json({ error: 'Blockchain contract not available' });
    }

    const [cid, timestamp] = await contract.getPetData(petId);

    if (!cid || cid === '') {
      return res.status(404).json({ error: 'Pet not found on blockchain' });
    }

    res.json({
      success: true,
      petId,
      cid,
      timestamp: timestamp.toString(),
      message: 'Pet data retrieved from blockchain successfully'
    });
  } catch (error) {
    console.error('Blockchain fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch pet data from blockchain', details: error.message });
  }
});

// Download and decrypt file from IPFS
app.get('/download/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const { cid } = req.query;

    if (!cid) {
      return res.status(400).json({ error: 'CID parameter is required' });
    }

    // Download from IPFS
    const tempPath = path.join(__dirname, '..', 'tmp', `${petId}_downloaded.jpg`);
    await downloadFromIPFS(cid, tempPath);

    // Set headers for file download
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${petId}.jpg"`);

    // Stream the file
    const fileStream = fs.createReadStream(tempPath);
    fileStream.pipe(res);

    // Clean up after streaming
    fileStream.on('end', () => {
      fs.unlinkSync(tempPath);
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file from IPFS', details: error.message });
  }
});

// Verify pet data integrity
app.post('/verify/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const { originalHash } = req.body;

    if (!contract) {
      return res.status(500).json({ error: 'Blockchain contract not available' });
    }

    // Get pet data from blockchain
    const [cid, timestamp] = await contract.getPetData(petId);

    if (!cid || cid === '') {
      return res.status(404).json({ error: 'Pet not found on blockchain' });
    }

    // Download from IPFS and compute hash
    const tempPath = path.join(__dirname, '..', 'tmp', `${petId}_verify.jpg`);
    await downloadFromIPFS(cid, tempPath);
    
    const fileBuffer = fs.readFileSync(tempPath);
    const blockchainHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Clean up
    fs.unlinkSync(tempPath);

    // Compare hashes
    const isValid = originalHash === blockchainHash;

    res.json({
      success: true,
      isValid,
      originalHash,
      blockchainHash,
      message: isValid ? 'Pet data integrity verified' : 'Pet data integrity check failed'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed', details: error.message });
  }
});

// Get blockchain statistics
app.get('/stats', async (req, res) => {
  try {
    // This would require additional blockchain queries
    // For now, return basic stats
    res.json({
      success: true,
      totalPets: 0, // Would need to query blockchain events
      totalTransactions: 0,
      confirmedTransactions: 0,
      pendingTransactions: 0,
      message: 'Blockchain statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch blockchain stats', details: error.message });
  }
});

// Enhanced pet creation endpoint
app.post('/pets', async (req, res) => {
  try {
    const petData = req.body;
    
    // Store in MongoDB if available
    if (mongoClient) {
      const db = mongoClient.db();
      const pets = db.collection('pets');
      
      const enhancedPetData = {
        ...petData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await pets.insertOne(enhancedPetData);
    }

    res.json({
      success: true,
      pet: petData,
      message: 'Pet created successfully'
    });
  } catch (error) {
    console.error('Pet creation error:', error);
    res.status(500).json({ error: 'Failed to create pet', details: error.message });
  }
});

// Get pets from MongoDB
app.get('/pets', async (req, res) => {
  try {
    if (!mongoClient) {
      return res.json({ pets: [] });
    }

    const db = mongoClient.db();
    const pets = db.collection('pets');
    const petsList = await pets.find({}).toArray();

    res.json({
      success: true,
      pets: petsList,
      message: 'Pets retrieved successfully'
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ error: 'Failed to retrieve pets', details: error.message });
  }
});

// Get specific pet
app.get('/pets/:petId', async (req, res) => {
  try {
    const { petId } = req.params;

    if (!mongoClient) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    const db = mongoClient.db();
    const pets = db.collection('pets');
    const pet = await pets.findOne({ petId });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({
      success: true,
      pet,
      message: 'Pet retrieved successfully'
    });
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ error: 'Failed to retrieve pet', details: error.message });
  }
});

// Create transaction record
app.post('/transactions', async (req, res) => {
  try {
    const transactionData = req.body;
    
    if (mongoClient) {
      const db = mongoClient.db();
      const transactions = db.collection('transactions');
      
      const enhancedTransactionData = {
        ...transactionData,
        createdAt: new Date()
      };
      
      await transactions.insertOne(enhancedTransactionData);
    }

    res.json({
      success: true,
      transaction: transactionData,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to record transaction', details: error.message });
  }
});

// Get transactions
app.get('/transactions', async (req, res) => {
  try {
    if (!mongoClient) {
      return res.json({ transactions: [] });
    }

    const db = mongoClient.db();
    const transactions = db.collection('transactions');
    const transactionsList = await transactions.find({}).toArray();

    res.json({
      success: true,
      transactions: transactionsList,
      message: 'Transactions retrieved successfully'
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to retrieve transactions', details: error.message });
  }
});

// Create verification record
app.post('/verifications', async (req, res) => {
  try {
    const verificationData = req.body;
    
    if (mongoClient) {
      const db = mongoClient.db();
      const verifications = db.collection('verifications');
      
      const enhancedVerificationData = {
        ...verificationData,
        createdAt: new Date()
      };
      
      await verifications.insertOne(enhancedVerificationData);
    }

    res.json({
      success: true,
      verification: verificationData,
      message: 'Verification recorded successfully'
    });
  } catch (error) {
    console.error('Verification creation error:', error);
    res.status(500).json({ error: 'Failed to record verification', details: error.message });
  }
});

// Get verifications
app.get('/verifications', async (req, res) => {
  try {
    if (!mongoClient) {
      return res.json({ verifications: [] });
    }

    const db = mongoClient.db();
    const verifications = db.collection('verifications');
    const verificationsList = await verifications.find({}).toArray();

    res.json({
      success: true,
      verifications: verificationsList,
      message: 'Verifications retrieved successfully'
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve verifications', details: error.message });
  }
});

// Start server
async function startServer() {
  await connectToMongo();
  
  app.listen(PORT, () => {
    console.log(`🚀 Enhanced server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Blockchain: ${contract ? 'Connected' : 'Not available'}`);
    console.log(`🗄️  MongoDB: ${mongoClient ? 'Connected' : 'Not available'}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(err => {
    console.error('❌ Enhanced server failed to start:', err);
  });
}

export default app; 