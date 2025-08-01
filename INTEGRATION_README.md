# PPC Blockchain Integration

This project integrates a blockchain-based pet storage system with a modern React website, providing secure, decentralized storage for pet information using IPFS and blockchain technology.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your blockchain and IPFS credentials
   ```

3. **Start the Integration**
   ```bash
   node start-integration.js
   ```

4. **Access the Application**
   - Website: http://localhost:3000
   - Blockchain API: http://localhost:3001

## 🏗️ Architecture

### Backend Components
- **Enhanced Server** (`backend/enhanced-server.js`): Express.js server with blockchain integration
- **Smart Contract** (`contracts/PetStorage.sol`): Solidity contract for pet data storage
- **IPFS Integration** (`ipfs/upload.js`): File upload to decentralized storage
- **Encryption** (`encryption/`): AES-256 encryption for file security

### Frontend Components
- **React Website** (`website/`): Modern TypeScript React application
- **Blockchain Integration** (`website/components/BlockchainIntegration.tsx`): Direct blockchain interaction
- **UI Components** (`website/components/ui/`): Reusable UI components

## 🔧 Features

### Blockchain Integration
- ✅ **IPFS File Storage**: Decentralized file storage with encryption
- ✅ **Blockchain Logging**: Immutable transaction records on Polygon
- ✅ **Data Verification**: SHA-256 hash verification for integrity
- ✅ **Real-time Monitoring**: Live blockchain connectivity status

### Security Features
- ✅ **AES-256 Encryption**: Military-grade file encryption
- ✅ **SHA-256 Hashing**: Cryptographic integrity verification
- ✅ **Blockchain Immutability**: Tamper-proof records
- ✅ **Decentralized Storage**: IPFS for censorship resistance

### User Experience
- ✅ **Modern UI**: Clean, responsive React interface
- ✅ **Offline Mode**: Local caching when blockchain unavailable
- ✅ **Real-time Updates**: Live status and transaction monitoring
- ✅ **File Management**: Upload, download, and verify pet data

## 📋 API Endpoints

### Blockchain Operations
```
POST /upload                    # Upload file to IPFS
POST /blockchain/log           # Log pet data to blockchain
GET  /blockchain/pet/:id      # Get pet data from blockchain
GET  /download/:id            # Download file from IPFS
POST /verify/:id              # Verify data integrity
GET  /stats                   # Get blockchain statistics
```

### Data Management
```
POST /pets                    # Create pet record
GET  /pets                    # Get all pets
POST /transactions            # Create transaction record
GET  /transactions            # Get all transactions
POST /verifications           # Create verification record
GET  /verifications           # Get all verifications
```

### System
```
GET  /health                  # Health check
```

## 🛠️ Configuration

### Environment Variables
```env
# Blockchain Configuration
PROVIDER_URL=https://polygon-amoy.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017/ppc

# IPFS Configuration
WEB3_STORAGE_TOKEN=your_web3_storage_token

# Server Ports
PORT=3001
```

### Smart Contract Deployment
1. Deploy `contracts/PetStorage.sol` to Polygon Amoy testnet
2. Update `CONTRACT_ADDRESS` in `.env`
3. Ensure wallet has testnet MATIC for transactions

## 🔄 Integration Flow

### Pet Data Upload Process
1. **User Input**: Pet information and photo uploaded via website
2. **File Encryption**: Optional AES-256 encryption applied
3. **IPFS Upload**: File uploaded to decentralized storage
4. **Blockchain Logging**: CID and metadata logged to smart contract
5. **Database Storage**: Record stored in MongoDB for user management
6. **Verification**: SHA-256 hash verification for integrity

### Data Verification Process
1. **Hash Comparison**: Original file hash vs blockchain hash
2. **IPFS Download**: File retrieved from decentralized storage
3. **Integrity Check**: Cryptographic verification of data integrity
4. **Result Display**: Verification status shown to user

## 🎯 Use Cases

### Pet Owners
- **Secure Storage**: Pet photos and information stored on blockchain
- **Data Integrity**: Cryptographic verification of data authenticity
- **Access Control**: Encrypted files with optional key management
- **Permanent Records**: Immutable blockchain records

### Veterinarians
- **Medical Records**: Secure storage of pet medical information
- **Data Verification**: Ensure medical records haven't been tampered
- **Access History**: Track who accessed pet data and when

### Pet Services
- **Identity Verification**: Verify pet identity using blockchain records
- **Service History**: Track pet service history immutably
- **Data Portability**: Easy transfer of pet data between services

## 🔐 Security Considerations

### Encryption
- Files are encrypted with AES-256 before IPFS upload
- Encryption keys can be user-generated or auto-generated
- Keys are not stored on blockchain (only file hashes)

### Blockchain Security
- Smart contract uses access controls
- Transaction data is immutable once confirmed
- Gas fees apply for blockchain operations

### Data Privacy
- IPFS content addressing provides censorship resistance
- User controls their own encryption keys
- No central authority can access encrypted data

## 🚨 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check dependencies
npm install

# Check environment variables
cat .env

# Check blockchain connectivity
curl http://localhost:3001/health
```

**Blockchain transactions failing**
```bash
# Check wallet balance
# Ensure testnet MATIC available

# Check contract deployment
# Verify CONTRACT_ADDRESS in .env
```

**IPFS upload issues**
```bash
# Check WEB3_STORAGE_TOKEN
# Verify internet connectivity
# Check file size limits (10MB)
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* node backend/enhanced-server.js
```

## 📈 Performance

### Optimization Features
- **File Size Limits**: 10MB maximum file size
- **Caching**: Local storage for offline functionality
- **Compression**: Automatic file compression before IPFS upload
- **Batch Operations**: Efficient blockchain transaction batching

### Monitoring
- **Health Checks**: Real-time service status monitoring
- **Transaction Tracking**: Live blockchain transaction monitoring
- **Error Handling**: Graceful degradation when services unavailable

## 🔮 Future Enhancements

### Planned Features
- **Multi-chain Support**: Ethereum, Polygon, other networks
- **Advanced Encryption**: Zero-knowledge proofs for privacy
- **Mobile App**: React Native mobile application
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Advanced Analytics**: Blockchain data analytics dashboard

### Scalability Improvements
- **IPFS Pinning**: Ensure data availability
- **Load Balancing**: Multiple blockchain nodes
- **CDN Integration**: Faster global access
- **Database Sharding**: Horizontal scaling for user data

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation
