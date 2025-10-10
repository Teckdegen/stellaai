import { readFileSync } from 'fs';
import { validateClarityCode } from './lib/clarity-validator';

// Read the test contract
const contractCode = readFileSync('./test-contract.clar', 'utf8');

// Validate the contract
const result = validateClarityCode(contractCode);

console.log('Validation Result:');
console.log('Is Valid:', result.isValid);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);