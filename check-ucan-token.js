#!/usr/bin/env node

import { Client } from "@web3-storage/w3up-client";
import dotenv from "dotenv";

dotenv.config();

console.log('🔍 Checking UCAN token validity...\n');

const ucanToken = process.env.UCAN_TOKEN;

if (!ucanToken) {
  console.log('❌ No UCAN_TOKEN found in .env file');
  console.log('\n💡 To get a new UCAN token:');
  console.log('1. Go to https://console.web3.storage/');
  console.log('2. Sign in with your account');
  console.log('3. Go to API Tokens');
  console.log('4. Create a new token');
  console.log('5. Copy the UCAN token');
  process.exit(1);
}

console.log('📋 Testing UCAN token...');

async function testToken() {
  try {
    const client = new Client();
    
    console.log('🔄 Initializing client...');
    await client.login(ucanToken);
    
    console.log('✅ UCAN token is valid!');
    console.log('🎉 Your token works with Storacha');
    
    // Test a simple operation
    console.log('🧪 Testing basic operation...');
    const identity = await client.identity();
    console.log('✅ Client identity verified');
    
    return true;
  } catch (error) {
    console.log('❌ UCAN token is invalid or expired');
    console.log('Error:', error.message);
    
    console.log('\n💡 To get a new UCAN token:');
    console.log('1. Go to https://console.web3.storage/');
    console.log('2. Sign in with your account');
    console.log('3. Go to API Tokens');
    console.log('4. Create a new token');
    console.log('5. Copy the UCAN token');
    console.log('6. Update your .env file');
    
    return false;
  }
}

testToken().then((isValid) => {
  if (!isValid) {
    console.log('\n🔧 To update your .env file:');
    console.log('1. Get a new UCAN token from the console');
    console.log('2. Replace the UCAN_TOKEN in your .env file');
    console.log('3. Run this script again to verify');
  }
}); 