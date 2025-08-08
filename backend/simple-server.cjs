const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Mock database
let pets = [
  { id: 'PET001', name: 'Max', species: 'Dog', breed: 'Golden Retriever', age: 3, cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', status: 'confirmed' },
  { id: 'PET002', name: 'Luna', species: 'Cat', breed: 'Persian', age: 2, cid: 'QmZ9tXpLm3K8vN2qR5sT7uW1xY4aB6cD9eF0gH2iJ3kL4mN', status: 'confirmed' },
  { id: 'PET003', name: 'Buddy', species: 'Dog', breed: 'Labrador', age: 5, cid: 'QmX8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3', status: 'pending' }
];

let transactions = [
  { id: 'TX001', petId: 'PET001', cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', txHash: '0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b', blockNumber: 4567890, status: 'confirmed' },
  { id: 'TX002', petId: 'PET002', cid: 'QmZ9tXpLm3K8vN2qR5sT7uW1xY4aB6cD9eF0gH2iJ3kL4mN', txHash: '0x8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', blockNumber: 4567891, status: 'confirmed' },
  { id: 'TX003', petId: 'PET003', cid: 'QmX8y7z6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3', txHash: '0x9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c', blockNumber: 4567892, status: 'pending' }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    blockchain: true,
    ipfs: true,
    database: true
  });
});

// Get all pets
app.get('/pets', (req, res) => {
  res.json(pets);
});

// Add new pet
app.post('/pets', (req, res) => {
  const { name, species, breed, age, description } = req.body;
  const newPet = {
    id: `PET${String(pets.length + 1).padStart(3, '0')}`,
    name,
    species,
    breed,
    age: parseInt(age),
    cid: `Qm${crypto.randomBytes(16).toString('hex')}`,
    status: 'confirmed',
    description
  };
  pets.push(newPet);
  res.json(newPet);
});

// Get all transactions
app.get('/transactions', (req, res) => {
  res.json(transactions);
});

// Add new transaction
app.post('/transactions', (req, res) => {
  const { petId, cid } = req.body;
  const newTransaction = {
    id: `TX${String(transactions.length + 1).padStart(3, '0')}`,
    petId,
    cid,
    txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
    blockNumber: Math.floor(Math.random() * 1000000) + 4000000,
    status: 'confirmed',
    timestamp: new Date().toISOString()
  };
  transactions.push(newTransaction);
  res.json(newTransaction);
});

// Get stats
app.get('/stats', (req, res) => {
  const stats = {
    totalPets: pets.length,
    totalTransactions: transactions.length,
    confirmedTransactions: transactions.filter(t => t.status === 'confirmed').length,
    pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    totalVerifications: pets.length,
    validVerifications: pets.filter(p => p.status === 'confirmed').length,
    successRate: Math.round((pets.filter(p => p.status === 'confirmed').length / pets.length) * 100)
  };
  res.json({ stats });
});

// Upload endpoint (simulated)
app.post('/upload', (req, res) => {
  const petId = `PET${String(pets.length + 1).padStart(3, '0')}`;
  const cid = `Qm${crypto.randomBytes(16).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(cid).digest('hex');
  
  res.json({
    petId,
    cid,
    hash,
    message: 'File uploaded successfully to IPFS'
  });
});

// Blockchain log endpoint
app.post('/blockchain/log', (req, res) => {
  const { petId, cid } = req.body;
  const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
  const blockNumber = Math.floor(Math.random() * 1000000) + 4000000;
  
  res.json({
    txHash,
    blockNumber,
    status: 'confirmed',
    message: 'Transaction logged to blockchain'
  });
});

// Verify endpoint
app.post('/verify/:petId', (req, res) => {
  const { petId } = req.params;
  const { originalHash } = req.body;
  
  const pet = pets.find(p => p.id === petId);
  if (!pet) {
    return res.status(404).json({ error: 'Pet not found' });
  }
  
  const isValid = Math.random() > 0.1; // 90% success rate
  
  res.json({
    isValid,
    originalHash,
    blockchainHash: pet.cid,
    message: isValid ? 'Data integrity verified' : 'Data integrity check failed'
  });
});

// Download endpoint (simulated)
app.get('/download/:petId', (req, res) => {
  const { petId } = req.params;
  const pet = pets.find(p => p.id === petId);
  
  if (!pet) {
    return res.status(404).json({ error: 'Pet not found' });
  }
  
  // Simulate file download
  res.json({
    petId,
    cid: pet.cid,
    filename: `${pet.name.toLowerCase()}.jpg`,
    message: 'File downloaded from IPFS'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple PPC Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🐾 Pets API: http://localhost:${PORT}/pets`);
  console.log(`🔗 Transactions API: http://localhost:${PORT}/transactions`);
  console.log(`📈 Stats API: http://localhost:${PORT}/stats`);
}); 