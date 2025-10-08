# Contract Deployment Guide

## Prerequisites

1. **STX Tokens**: Ensure your wallet has sufficient STX for transaction fees
   - For testnet: Get STX from the [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
   - For mainnet: Transfer STX to your wallet

2. **Private Key**: You'll need your Stacks private key for deployment

## Deployment Process

1. **Validate Your Contract**: 
   - The IDE automatically validates your Clarity code
   - Fix any errors shown in the console before deploying

2. **Click "Deploy Contract"**:
   - Located in the top-right corner of the IDE
   - Only enabled when you have valid code

3. **Enter Private Key**:
   - A dialog will prompt for your private key
   - Your key is never stored or transmitted

4. **Confirm Deployment**:
   - Review the transaction details
   - Click "Deploy" to submit to the blockchain

## Common Issues

### "NotEnoughFunds" Error
- **Cause**: Insufficient STX balance for transaction fees
- **Solution**: 
  - For testnet: Use the faucet to get more STX
  - For mainnet: Transfer more STX to your wallet

### "ContractAlreadyExists" Error
- **Cause**: A contract with the same name already exists for your address
- **Solution**: Change your contract name in the project settings

### "Transaction Aborted During Execution" Error
- **Cause**: The transaction was included in a block but failed during execution due to:
  - Violation of Stacks protocol rules
  - Errors in the smart contract code
  - Insufficient funds (even if initial validation passed)
- **Solution**:
  - Review your contract code for syntax or logical errors
  - Ensure your wallet has sufficient STX for the entire transaction
  - Check the transaction details on the Stacks explorer for more information
  - Validate your code thoroughly before deployment

## Deployment Script Example

If you prefer to deploy manually, here's a Node.js script example:

```javascript
import { 
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode 
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { readFileSync } from 'fs';

async function deployContract() {
  const network = new StacksTestnet();
  
  // Read contract source code
  const contractSource = readFileSync('./contracts/my-contract.clar', 'utf-8');
  
  const txOptions = {
    contractName: 'my-contract',
    codeBody: contractSource,
    senderKey: 'your-private-key',
    network,
    anchorMode: AnchorMode.Any,
    fee: 10000, // Higher fee for deployment
  };
  
  const transaction = await makeContractDeploy(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Contract deployed!');
  console.log('Transaction ID:', broadcastResponse.txid);
  console.log('Contract address:', `${senderAddress}.${txOptions.contractName}`);
}
```

## Network Differences

- **Testnet**: 
  - Free to use
  - STX from faucet
  - Ideal for testing and development

- **Mainnet**: 
  - Real STX tokens required
  - Production environment
  - Transactions have real financial value

## Best Practices

1. **Test First**: Always deploy to testnet before mainnet
2. **Review Code**: Carefully review generated code before deployment
3. **Secure Keys**: Never share your private keys
4. **Backup Projects**: The IDE stores projects locally in your browser