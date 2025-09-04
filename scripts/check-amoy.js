#!/usr/bin/env node
import 'dotenv/config';
import { ethers } from 'ethers';

const ensure0x = (hex) => (hex?.startsWith('0x') ? hex : `0x${hex}`);

const PROVIDER_URL   = process.env.PROVIDER_URL;
const PRIVATE_KEY    = ensure0x(process.env.PRIVATE_KEY || '');
const CONTRACT_ADDR  = process.env.CONTRACT_ADDRESS;

if (!PROVIDER_URL) throw new Error('Missing PROVIDER_URL');
if (!/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) throw new Error('PRIVATE_KEY must be 0x + 64 hex chars');
if (!ethers.isAddress(CONTRACT_ADDR)) throw new Error('CONTRACT_ADDRESS is not a valid address');

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

(async () => {
  const net = await provider.getNetwork();
  console.log('Network chainId:', Number(net.chainId)); // expect 80002 (Polygon Amoy)
  if (Number(net.chainId) !== 80002) throw new Error('Not on Polygon Amoy (expected chainId 80002)');

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Wallet address:', wallet.address);

  const bal = await provider.getBalance(wallet.address);
  console.log('Balance (MATIC):', ethers.formatEther(bal));

  const code = await provider.getCode(CONTRACT_ADDR);
  console.log('Contract code size (bytes):', (code.length - 2) / 2);
  if (code === '0x') throw new Error('No bytecode at CONTRACT_ADDRESS on Amoy');

  console.log('✅ All good: provider, key, and contract match Amoy.');
})().catch(e => {
  console.error('❌ Check failed:', e.message);
  process.exit(1);
});
