import { 
  makeContractDeploy, 
  broadcastTransaction, 
  getAddressFromPrivateKey,
  validateContractCall
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export interface DeployContractOptions {
  contractName: string;
  codeBody: string;
  senderKey: string;
  network: 'testnet' | 'mainnet';
  fee?: number;
  nonce?: number;
}

export interface DeployResult {
  txid: string;
  contractId: string;
  senderAddress: string;
}

/**
 * Deploy a Clarity smart contract to the Stacks blockchain
 * @param options Deployment options
 * @returns Deployment result with transaction ID and contract ID
 */
export async function deployContract(options: DeployContractOptions): Promise<DeployResult> {
  const { contractName, codeBody, senderKey, network, fee, nonce } = options;
  
  // Validate required parameters
  if (!contractName) {
    throw new Error('Contract name is required');
  }
  
  if (!codeBody) {
    throw new Error('Contract code body is required');
  }
  
  if (!senderKey) {
    throw new Error('Sender private key is required');
  }
  
  // Set up the correct network
  const stacksNetwork = network === 'testnet' ? STACKS_TESTNET : STACKS_MAINNET;
  
  // Get sender address from private key
  const senderAddress = getAddressFromPrivateKey(senderKey, stacksNetwork);
  
  // Clean contract name (alphanumeric, hyphens, underscores only)
  const cleanContractName = contractName.replace(/[^a-zA-Z0-9_-]/g, '-');
  
  // Validate contract code
  try {
    // Basic validation - this will throw if there are syntax errors
    validateContractCall(codeBody);
  } catch (error) {
    throw new Error(`Invalid contract code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Prepare transaction options
  const txOptions: any = {
    contractName: cleanContractName,
    codeBody: codeBody,
    senderKey: senderKey,
    network: stacksNetwork,
  };
  
  // Add optional parameters if provided
  if (fee !== undefined) {
    txOptions.fee = fee;
  }
  
  if (nonce !== undefined) {
    txOptions.nonce = nonce;
  }
  
  try {
    // Create the contract deployment transaction
    const transaction = await makeContractDeploy(txOptions);
    
    // Broadcast the transaction
    const broadcastResponse = await broadcastTransaction(transaction, stacksNetwork);
    
    // Check if broadcast was successful
    if ('error' in broadcastResponse) {
      throw new Error(`Transaction broadcast failed: ${broadcastResponse.error}`);
    }
    
    if (!broadcastResponse.txid) {
      throw new Error('No transaction ID returned from broadcast');
    }
    
    return {
      txid: broadcastResponse.txid,
      contractId: `${senderAddress}.${cleanContractName}`,
      senderAddress: senderAddress
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
    throw new Error('Deployment failed: Unknown error');
  }
}

/**
 * Get the explorer URL for a transaction
 * @param txid Transaction ID
 * @param network Network (testnet or mainnet)
 * @returns Explorer URL
 */
export function getExplorerUrl(txid: string, network: 'testnet' | 'mainnet'): string {
  const baseUrl = 'https://explorer.stacks.co/txid';
  const chain = network === 'testnet' ? 'testnet' : 'mainnet';
  return `${baseUrl}/${txid}?chain=${chain}`;
}

/**
 * Get the faucet URL for testnet STX
 * @returns Faucet URL
 */
export function getFaucetUrl(): string {
  return 'https://explorer.stacks.co/sandbox/faucet?chain=testnet';
}