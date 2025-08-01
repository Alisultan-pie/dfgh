import { createClient } from 'npm:@supabase/supabase-js@2';
import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['https://figma.com', 'https://www.figma.com'],
  credentials: true,
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to get user from access token
const getUserFromToken = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  
  return user;
};

// Auth routes
app.post('/make-server-fc39f46a/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/make-server-fc39f46a/auth/user', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    return c.json({ user });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Pet management routes
app.post('/make-server-fc39f46a/pets', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { petId, ownerInfo, encryptionKey, ipfsCid, blockchainTxHash } = await c.req.json();
    
    const petData = {
      pet_id: petId,
      user_id: user.id,
      owner_info: ownerInfo,
      encryption_key: encryptionKey,
      ipfs_cid: ipfsCid,
      blockchain_tx_hash: blockchainTxHash,
      created_at: new Date().toISOString(),
      status: 'completed'
    };
    
    // Store in KV store with user-specific key
    const key = `pet:${user.id}:${petId}`;
    await kv.set(key, petData);
    
    // Also store in user's pet list
    const userPetsKey = `user_pets:${user.id}`;
    const existingPets = await kv.get(userPetsKey) || [];
    const updatedPets = [...existingPets, petData];
    await kv.set(userPetsKey, updatedPets);
    
    return c.json({ success: true, pet: petData });
  } catch (error) {
    console.log('Create pet error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/make-server-fc39f46a/pets', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userPetsKey = `user_pets:${user.id}`;
    const pets = await kv.get(userPetsKey) || [];
    
    return c.json({ pets });
  } catch (error) {
    console.log('Get pets error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/make-server-fc39f46a/pets/:petId', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const petId = c.req.param('petId');
    const key = `pet:${user.id}:${petId}`;
    const pet = await kv.get(key);
    
    if (!pet) {
      return c.json({ error: 'Pet not found' }, 404);
    }
    
    return c.json({ pet });
  } catch (error) {
    console.log('Get pet error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Blockchain transaction routes
app.post('/make-server-fc39f46a/transactions', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { petId, txHash, cid, blockNumber, gasUsed, status } = await c.req.json();
    
    const transactionData = {
      id: `tx_${Date.now()}`,
      pet_id: petId,
      user_id: user.id,
      tx_hash: txHash,
      cid,
      block_number: blockNumber,
      gas_used: gasUsed,
      status,
      timestamp: new Date().toISOString(),
      network: 'Polygon Amoy'
    };
    
    // Store transaction
    const txKey = `transaction:${user.id}:${transactionData.id}`;
    await kv.set(txKey, transactionData);
    
    // Add to user's transaction list
    const userTxKey = `user_transactions:${user.id}`;
    const existingTxs = await kv.get(userTxKey) || [];
    const updatedTxs = [...existingTxs, transactionData];
    await kv.set(userTxKey, updatedTxs);
    
    return c.json({ success: true, transaction: transactionData });
  } catch (error) {
    console.log('Create transaction error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/make-server-fc39f46a/transactions', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userTxKey = `user_transactions:${user.id}`;
    const transactions = await kv.get(userTxKey) || [];
    
    return c.json({ transactions });
  } catch (error) {
    console.log('Get transactions error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Verification routes
app.post('/make-server-fc39f46a/verifications', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { petId, cid, originalHash, downloadedHash, isValid, fileSize, encryptionIntact, downloadTime } = await c.req.json();
    
    const verificationData = {
      id: `ver_${Date.now()}`,
      pet_id: petId,
      user_id: user.id,
      cid,
      original_hash: originalHash,
      downloaded_hash: downloadedHash,
      is_valid: isValid,
      file_size: fileSize,
      encryption_intact: encryptionIntact,
      download_time: downloadTime,
      verified_at: new Date().toISOString()
    };
    
    // Store verification
    const verKey = `verification:${user.id}:${verificationData.id}`;
    await kv.set(verKey, verificationData);
    
    // Add to user's verification list
    const userVerKey = `user_verifications:${user.id}`;
    const existingVers = await kv.get(userVerKey) || [];
    const updatedVers = [...existingVers, verificationData];
    await kv.set(userVerKey, updatedVers);
    
    return c.json({ success: true, verification: verificationData });
  } catch (error) {
    console.log('Create verification error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/make-server-fc39f46a/verifications', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userVerKey = `user_verifications:${user.id}`;
    const verifications = await kv.get(userVerKey) || [];
    
    return c.json({ verifications });
  } catch (error) {
    console.log('Get verifications error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Dashboard stats route
app.get('/make-server-fc39f46a/stats', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const pets = await kv.get(`user_pets:${user.id}`) || [];
    const transactions = await kv.get(`user_transactions:${user.id}`) || [];
    const verifications = await kv.get(`user_verifications:${user.id}`) || [];
    
    const stats = {
      totalPets: pets.length,
      totalTransactions: transactions.length,
      confirmedTransactions: transactions.filter((tx: any) => tx.status === 'confirmed').length,
      pendingTransactions: transactions.filter((tx: any) => tx.status === 'pending').length,
      totalVerifications: verifications.length,
      validVerifications: verifications.filter((v: any) => v.is_valid).length,
      successRate: verifications.length > 0 ? Math.round((verifications.filter((v: any) => v.is_valid).length / verifications.length) * 100) : 0
    };
    
    return c.json({ stats });
  } catch (error) {
    console.log('Get stats error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check
app.get('/make-server-fc39f46a/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);