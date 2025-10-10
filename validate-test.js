// Simple test to validate the contract
const fs = require('fs');

// Mock validation function to test the contract
function simpleValidate(code) {
  const lines = code.split('\n');
  const errors = [];
  const warnings = [];
  
  // Check for basic structure
  if (!code.includes('define-')) {
    errors.push('Contract must contain at least one define- declaration');
  }
  
  // Check for balanced parentheses
  let parenCount = 0;
  lines.forEach((line, index) => {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '(') parenCount++;
      if (line[i] === ')') parenCount--;
      if (parenCount < 0) {
        errors.push(`Unmatched closing parenthesis on line ${index + 1}`);
        parenCount = 0;
      }
    }
  });
  
  if (parenCount > 0) {
    errors.push(`${parenCount} unclosed parenthesis(es)`);
  }
  
  // Check data var declarations
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('(define-data-var')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length < 4) {
        errors.push(`define-data-var requires name, type, and initial value on line ${index + 1}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Read and validate the contract
const contractCode = fs.readFileSync('./test-contract.clar', 'utf8');
const result = simpleValidate(contractCode);

console.log('Validation Result:');
console.log('Is Valid:', result.isValid);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);