// Mock authentication for demonstration purposes
// This simulates the Supabase auth functionality

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

interface MockAuthState {
  user: User | null;
  users: Record<string, { email: string; password: string; name: string; id: string }>;
}

const STORAGE_KEY = 'ppc_auth_state';

// Initialize mock auth state
const getInitialState = (): MockAuthState => {
  if (typeof window === 'undefined') {
    return { user: null, users: {} };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
  }
  
  return { user: null, users: {} };
};

let authState = getInitialState();

const saveState = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }
};

export const mockAuth = {
  async signUp(email: string, password: string, name: string) {
    if (authState.users[email]) {
      throw new Error('User already exists');
    }
    
    const userId = `user_${Date.now()}`;
    authState.users[email] = { email, password, name, id: userId };
    authState.user = { id: userId, email, user_metadata: { name } };
    saveState();
    
    return { user: authState.user };
  },

  async signIn(email: string, password: string) {
    const user = authState.users[email];
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    authState.user = { id: user.id, email, user_metadata: { name: user.name } };
    saveState();
    
    return { user: authState.user };
  },

  async signOut() {
    authState.user = null;
    saveState();
  },

  async getSession() {
    return { user: authState.user };
  },

  getCurrentUser() {
    return authState.user;
  },

  onAuthStateChange(_callback: (event: string, session: { user: User | null } | null) => void) {
    // Return a mock subscription
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
};

// Mock API client
const mockData = {
  pets: [] as any[],
  transactions: [] as any[],
  verifications: [] as any[]
};

export const mockApiClient = {
  async createPet(petData: any) {
    const user = mockAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const pet = { ...petData, id: `pet_${Date.now()}`, user_id: user.id };
    mockData.pets.push(pet);
    return { success: true, pet };
  },

  async getPets() {
    const user = mockAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const userPets = mockData.pets.filter(pet => pet.user_id === user.id);
    return { pets: userPets };
  },

  async getPet(petId: string) {
    const user = mockAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const pet = mockData.pets.find(p => p.petId === petId && p.user_id === user.id);
    if (!pet) throw new Error('Pet not found');
    
    return { pet };
  },

  async createTransaction(transactionData: any) {
    const user = mockAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const transaction = { ...transactionData, id: `tx_${Date.now()}`, user_id: user.id };
    mockData.transactions.push(transaction);
    return { success: true, transaction };
  },

  async getTransactions() {
    const user = mockAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const userTxs = mockData.transactions.filter(tx => tx.user_id === user.id);
    return { transactions: userTxs };
  },

  async createVerification(verificationData: any) {
    const user = mockAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const verification = { ...verificationData, id: `ver_${Date.now()}`, user_id: user.id };
    mockData.verifications.push(verification);
    return { success: true, verification };
  },

  async getVerifications() {
    const user = mockAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const userVers = mockData.verifications.filter(v => v.user_id === user.id);
    return { verifications: userVers };
  },

  async getStats() {
    const user = mockAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const userPets = mockData.pets.filter(pet => pet.user_id === user.id);
    const userTxs = mockData.transactions.filter(tx => tx.user_id === user.id);
    const userVers = mockData.verifications.filter(v => v.user_id === user.id);
    
    const stats = {
      totalPets: userPets.length,
      totalTransactions: userTxs.length,
      confirmedTransactions: userTxs.filter(tx => tx.status === 'confirmed').length,
      pendingTransactions: userTxs.filter(tx => tx.status === 'pending').length,
      totalVerifications: userVers.length,
      validVerifications: userVers.filter(v => v.is_valid).length,
      successRate: userVers.length > 0 ? Math.round((userVers.filter(v => v.is_valid).length / userVers.length) * 100) : 0
    };
    
    return { stats };
  }
};