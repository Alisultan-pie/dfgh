
import { projectId, publicAnonKey } from '../supabase/info';

// Mock Supabase client for now - we'll integrate this properly later
const createClient = (_url: string, _key: string) => ({
  auth: {
    getSession: async () => ({ data: { session: null } })
  }
});

// Blockchain configuration
const BLOCKCHAIN_API_URL = process.env.REACT_APP_BLOCKCHAIN_API_URL || 'http://localhost:3001';

// Supabase client for user management
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// IPFS and Blockchain integration
export class BlockchainClient {
  constructor() {
    // Initialize blockchain client
    // Note: Contract ABI would need to be imported or defined here
    // this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
  }

  // Upload file to IPFS
  async uploadToIPFS(file: File, encryptionKey?: string): Promise<{ cid: string; hash: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (encryptionKey) {
        formData.append('encryptionKey', encryptionKey);
      }

      const response = await fetch(`${BLOCKCHAIN_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('IPFS upload failed');
      }

      const result = await response.json();
      return { cid: result.cid, hash: result.hash };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  }

  // Log pet data to blockchain
  async logPetToBlockchain(petId: string, cid: string, timestamp: number): Promise<{ txHash: string; blockNumber: number }> {
    try {
      const response = await fetch(`${BLOCKCHAIN_API_URL}/blockchain/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petId,
          cid,
          timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error('Blockchain transaction failed');
      }

      const result = await response.json();
      return {
        txHash: result.txHash,
        blockNumber: result.blockNumber,
      };
    } catch (error) {
      console.error('Blockchain transaction error:', error);
      throw error;
    }
  }

  // Get pet data from blockchain
  async getPetFromBlockchain(petId: string): Promise<{ cid: string; timestamp: number } | null> {
    try {
      const response = await fetch(`${BLOCKCHAIN_API_URL}/blockchain/pet/${petId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch pet data from blockchain');
      }

      const result = await response.json();
      return {
        cid: result.cid,
        timestamp: result.timestamp,
      };
    } catch (error) {
      console.error('Blockchain fetch error:', error);
      throw error;
    }
  }

  // Download and decrypt file from IPFS
  async downloadFromIPFS(cid: string, petId: string): Promise<Blob> {
    try {
      const response = await fetch(`${BLOCKCHAIN_API_URL}/download/${petId}?cid=${cid}`);
      
      if (!response.ok) {
        throw new Error('Failed to download from IPFS');
      }

      return await response.blob();
    } catch (error) {
      console.error('IPFS download error:', error);
      throw error;
    }
  }

  // Verify pet data integrity
  async verifyPetData(petId: string, originalHash: string): Promise<{ isValid: boolean; blockchainHash: string }> {
    try {
      const response = await fetch(`${BLOCKCHAIN_API_URL}/verify/${petId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalHash }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const result = await response.json();
      return {
        isValid: result.isValid,
        blockchainHash: result.blockchainHash,
      };
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  // Get blockchain statistics
  async getBlockchainStats(): Promise<{
    totalPets: number;
    totalTransactions: number;
    confirmedTransactions: number;
    pendingTransactions: number;
  }> {
    try {
      const response = await fetch(`${BLOCKCHAIN_API_URL}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blockchain stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Stats fetch error:', error);
      return {
        totalPets: 0,
        totalTransactions: 0,
        confirmedTransactions: 0,
        pendingTransactions: 0,
      };
    }
  }

  // Check blockchain connectivity
  async isBlockchainOnline(): Promise<boolean> {
    try {
      const response = await fetch(`${BLOCKCHAIN_API_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Blockchain connectivity check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const blockchainClient = new BlockchainClient();

// Enhanced API client that combines Supabase and Blockchain
export const enhancedApiClient = {
  // ... existing methods from the original apiClient
  async request(endpoint: string, options: RequestInit = {}) {
    try {

      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BLOCKCHAIN_API_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorText;
        } catch {
          errorMessage = errorText || 'API request failed';
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error: any) {
      console.error(`API request error for ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Enhanced pet creation with blockchain integration
  async createPet(petData: any) {
    try {
      // First, upload to IPFS
      const file = petData.file;
      const { cid, hash } = await blockchainClient.uploadToIPFS(file, petData.encryptionKey);
      
      // Then, log to blockchain
      const timestamp = Math.floor(Date.now() / 1000);
      const { txHash, blockNumber } = await blockchainClient.logPetToBlockchain(
        petData.petId,
        cid,
        timestamp
      );

      // Store in Supabase for user management
      const enhancedPetData = {
        ...petData,
        ipfsCid: cid,
        ipfsHash: hash,
        blockchainTxHash: txHash,
        blockchainBlockNumber: blockNumber,
        blockchainTimestamp: timestamp,
      };

      const response = await this.request('/pets', {
        method: 'POST',
        body: JSON.stringify(enhancedPetData),
      });

      return {
        ...response,
        blockchainData: {
          cid,
          hash,
          txHash,
          blockNumber,
          timestamp,
        },
      };
    } catch (error) {
      console.error('Enhanced pet creation failed:', error);
      throw error;
    }
  },

  // Enhanced pet verification
  async verifyPet(petId: string, originalHash: string) {
    try {
      const verificationResult = await blockchainClient.verifyPetData(petId, originalHash);
      
      const verificationData = {
        petId,
        originalHash,
        blockchainHash: verificationResult.blockchainHash,
        isValid: verificationResult.isValid,
        verifiedAt: new Date().toISOString(),
      };

      const response = await this.request('/verifications', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });

      return {
        ...response,
        blockchainVerification: verificationResult,
      };
    } catch (error) {
      console.error('Enhanced pet verification failed:', error);
      throw error;
    }
  },

  // Get enhanced stats including blockchain data
  async getStats() {
    try {
      const [supabaseStats, blockchainStats] = await Promise.all([
        this.request('/stats'),
        blockchainClient.getBlockchainStats(),
      ]);

      return {
        stats: {
          ...supabaseStats.stats,
          ...blockchainStats,
        },
      };
    } catch (error) {
      console.error('Enhanced stats fetch failed:', error);
      return {
        stats: {
          totalPets: 0,
          totalTransactions: 0,
          confirmedTransactions: 0,
          pendingTransactions: 0,
          totalVerifications: 0,
          validVerifications: 0,
          successRate: 0,
        },
      };
    }
  },

  // Check overall system connectivity
  async isOnline(): Promise<boolean> {
    try {
      const [supabaseOnline, blockchainOnline] = await Promise.all([
        this.request('/health').then(() => true).catch(() => false),
        blockchainClient.isBlockchainOnline(),
      ]);

      return supabaseOnline || blockchainOnline;
    } catch (error) {
      console.error('Connectivity check failed:', error);
      return false;
    }
  },
};



// Export the enhanced client as the main API client
export const apiClient = enhancedApiClient; 