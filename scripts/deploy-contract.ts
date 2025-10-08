#!/usr/bin/env ts-node

import { deployContract, getExplorerUrl, getFaucetUrl } from '../lib/contract-deployer';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Standalone contract deployment script
 * Usage: npm run deploy -- --network=testnet --contract=my-contract.clar --key=your-private-key
 */

interface DeployOptions {
  network: 'testnet' | 'mainnet';
  contract: string;
  key: string;
  fee?: string;
  name?: string;
}

async function main() {
  // Parse command line arguments
  const args = parseArgs();
  
  if (!args.network || !args.contract || !args.key) {
    console.error('Missing required arguments');
    console.log('Usage: npm run deploy -- --network=testnet|mainnet --contract=path/to/contract.clar --key=your-private-key [--fee=1000] [--name=contract-name]');
    console.log('Example: npm run deploy -- --network=testnet --contract=./contracts/my-contract.clar --key=your-private-key --fee=1000');
    process.exit(1);
  }
  
  try {
    console.log(`Deploying contract to ${args.network}...`);
    
    // Read contract file
    const contractPath = join(process.cwd(), args.contract);
    const codeBody = readFileSync(contractPath, 'utf-8');
    
    // Extract contract name from file name if not provided
    const contractName = args.name || args.contract.split('/').pop()?.replace('.clar', '') || 'unnamed-contract';
    
    // Parse fee if provided
    const fee = args.fee ? parseInt(args.fee, 10) : undefined;
    
    // Deploy contract
    const result = await deployContract({
      contractName,
      codeBody,
      senderKey: args.key,
      network: args.network,
      fee
    });
    
    console.log('✅ Contract deployed successfully!');
    console.log(`Transaction ID: ${result.txid}`);
    console.log(`Contract ID: ${result.contractId}`);
    console.log(`Sender Address: ${result.senderAddress}`);
    console.log(`Explorer URL: ${getExplorerUrl(result.txid, args.network)}`);
    
    // Save deployment info
    const deploymentInfo = {
      network: args.network,
      contractName,
      txid: result.txid,
      contractId: result.contractId,
      senderAddress: result.senderAddress,
      deployedAt: new Date().toISOString()
    };
    
    const infoPath = contractPath.replace('.clar', `-${args.network}-deployment.json`);
    writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to: ${infoPath}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error instanceof Error ? error.message : 'Unknown error');
    
    if (args.network === 'testnet') {
      console.log(`\nNeed STX for testing? Get them from the faucet: ${getFaucetUrl()}`);
    }
    
    process.exit(1);
  }
}

function parseArgs(): DeployOptions {
  const args: DeployOptions = { network: 'testnet', contract: '', key: '' };
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      switch (key) {
        case 'network':
          if (value === 'testnet' || value === 'mainnet') {
            args.network = value;
          }
          break;
        case 'contract':
          args.contract = value || '';
          break;
        case 'key':
          args.key = value || '';
          break;
        case 'fee':
          args.fee = value || undefined;
          break;
        case 'name':
          args.name = value || undefined;
          break;
      }
    }
  }
  
  return args;
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}