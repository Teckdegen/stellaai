// Simple test to verify the unified chat API
async function testUnifiedChatAPI() {
  try {
    const response = await fetch('/api/unified-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello, test message' }
        ],
        contractName: 'test-contract',
        network: 'testnet',
        currentCode: '',
        codebaseContext: 'Test context'
      }),
    });

    if (response.ok) {
      console.log('Unified chat API test passed');
      const text = await response.text();
      console.log('Response:', text.substring(0, 100) + '...');
    } else {
      console.error('Unified chat API test failed:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Unified chat API test error:', error);
  }
}

// Run the test
testUnifiedChatAPI();