// Test file for Groq client
import { testGroqConnection, generateClarityCode } from './groq-client';

// Simple test to verify the Groq client works
async function runTests() {
  console.log('Testing Groq API connection...');
  
  try {
    const isConnected = await testGroqConnection();
    console.log('Groq API connection test:', isConnected ? 'PASSED' : 'FAILED');
    
    if (isConnected) {
      console.log('Testing Clarity code generation...');
      const systemPrompt = "You are a Clarity smart contract developer. Generate a simple counter contract.";
      const prompt = "Create a Clarity contract with a counter variable and increment function.";
      
      const code = await generateClarityCode(prompt, systemPrompt);
      console.log('Generated code:', code);
      console.log('Code generation test: PASSED');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}