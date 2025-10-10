// Test script for the validation service
const testContract = `
;; Simple counter contract
(define-data-var counter int 0)

;; Public function to increment the counter
(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) 1))
    (ok (var-get counter))
  )
)

;; Public function to decrement the counter
(define-public (decrement)
  (begin
    (var-set counter (- (var-get counter) 1))
    (ok (var-get counter))
  )
)

;; Read-only function to get the current counter value
(define-read-only (get-counter)
  (var-get counter)
)
`;

async function testValidationService() {
  try {
    console.log('Testing validation service...');
    
    const response = await fetch('http://localhost:3000/api/validate-clarity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractCode: testContract,
        contractName: 'test-counter'
      }),
    });
    
    const result = await response.json();
    console.log('Validation Service Test Result:');
    console.log('Success:', result.success);
    console.log('Output:', result.output);
    console.log('Errors:', result.errors);
  } catch (error) {
    console.error('Error testing validation service:', error);
  }
}

// Run the test
testValidationService();