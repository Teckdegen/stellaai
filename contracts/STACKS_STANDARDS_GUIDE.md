# Stacks Blockchain and Clarity Smart Contract Standards Guide

This guide provides comprehensive standards and best practices for developing Clarity smart contracts on the Stacks blockchain. All AI-generated contracts should follow these guidelines.

## Contract Structure Standards

### 1. Standard Contract Sections

All contracts must follow this exact structure:

```
;; Contract Name
;; Brief description of what the contract does

;; Contract Header
;; ===============================================

;; Constants
;; Error Codes
;; Data Variables
;; Data Maps
;; Traits

;; Public Functions
;; ===============================================

;; Read-only Functions
;; ===============================================

;; Update Functions
;; ===============================================
```

### 2. Section Headers

- Use `;; ===============================================` as a section divider
- Each major section should have a clear header comment
- Group related functionality together

## Naming Conventions

### Functions
- Use kebab-case: `create-listing`, `get-owner`, `transfer-token`
- Public functions start with verbs: `create-`, `get-`, `set-`, `update-`, `delete-`
- Private functions start with verbs: `validate-`, `calculate-`, `format-`

### Variables
- Use snake_case: `listing_counter`, `token_id`, `is_active`
- Data variables: `var-name`
- Data maps: `map-name`

### Constants
- Use kebab-case: `owner`, `max-supply`, `fee-percentage`
- Error codes: `err-not-found`, `err-unauthorized`, `err-invalid-state`

### Error Codes
- Use descriptive names with `err-` prefix
- Use HTTP-like status codes when appropriate:
  - `err-not-found` (u404)
  - `err-unauthorized` (u403)
  - `err-invalid-state` (u400)
  - `err-already-exists` (u409)

## Data Types and Structures

### Standard Types
- `uint` for counters, amounts, IDs
- `int` for mathematical calculations that may be negative
- `principal` for wallet addresses
- `bool` for flags
- `buff` for binary data
- `string-ascii` for ASCII text
- `string-utf8` for Unicode text

### Complex Types
- Use tuples for structured data: `{ owner: principal, amount: uint, active: bool }`
- Use traits for contract interfaces
- Use optional types when values may be absent: `(optional principal)`

## Error Handling

### Standard Error Pattern
```clarity
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-invalid-state (err u400))

;; In functions:
(asserts! (is-eq tx-sender owner) err-unauthorized)
(let ((value (unwrap! (map-get? data-map key) err-not-found)))
  ;; ... continue with value
)
```

### Return Values
- Public functions MUST return `(ok ...)` or `(err ...)`
- Read-only functions can return any type directly
- Private functions can return any type directly

## Access Control

### Standard Patterns
```clarity
;; Check if caller is owner
(asserts! (is-eq tx-sender owner) err-unauthorized)

;; Check if caller is token owner
(asserts! (is-eq tx-sender (get owner token-data)) err-unauthorized)

;; Check if state allows action
(asserts! (get active item) err-invalid-state)
```

## State Management

### Data Variables
```clarity
(define-data-var counter uint u0)
(define-data-var is-paused bool false)
(define-data-var owner principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

### Data Maps
```clarity
(define-map tokens uint { owner: principal, active: bool })
(define-map balances principal uint)
(define-map approvals principal (optional principal))
```

### CRUD Operations
```clarity
;; Create
(map-set map-name key value)

;; Read
(map-get? map-name key)

;; Update
(map-set map-name key (merge (map-get? map-name key) { field: new-value }))

;; Delete
(map-delete map-name key)
```

## Function Design

### Public Functions
```clarity
(define-public (function-name (param1 type1) (param2 type2))
  (begin
    ;; Validation
    (asserts! condition err-code)
    
    ;; Logic
    (let ((local-var value))
      ;; ... implementation
    )
    
    ;; Return
    (ok result)
  )
)
```

### Read-only Functions
```clarity
(define-read-only (function-name (param1 type1) (param2 type2))
  ;; Logic
  result
)
```

### Private Functions
```clarity
(define-private (function-name (param1 type1) (param2 type2))
  (begin
    ;; Logic
    result
  )
)
```

## Common Patterns

### Counter Pattern
```clarity
(define-data-var counter uint u0)

(define-public (create-item)
  (let ((id (+ (var-get counter) u1)))
    (map-set items id value)
    (var-set counter id)
    (ok id)
  )
)
```

### Ownership Pattern
```clarity
(define-map items uint { owner: principal, active: bool })

(define-public (update-item (id uint))
  (let ((item (unwrap! (map-get? items id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner item)) err-unauthorized)
    (asserts! (get active item) err-invalid-state)
    (map-set items id (merge item { active: false }))
    (ok true)
  )
)
```

### Balance Pattern
```clarity
(define-map balances principal uint)

(define-public (transfer (to principal) (amount uint))
  (begin
    (asserts! (> (default-to u0 (map-get? balances tx-sender)) amount) err-insufficient-balance)
    (map-set balances tx-sender (- (default-to u0 (map-get? balances tx-sender)) amount))
    (map-set balances to (+ (default-to u0 (map-get? balances to)) amount))
    (ok true)
  )
)
```

## Security Best Practices

### 1. Always Validate Inputs
```clarity
(asserts! (> amount u0) err-invalid-amount)
```

### 2. Always Check Authorization
```clarity
(asserts! (is-eq tx-sender owner) err-unauthorized)
```

### 3. Always Validate State
```clarity
(asserts! (get active item) err-invalid-state)
```

### 4. Use Proper Error Codes
```clarity
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
```

### 5. Avoid Reentrancy
- Use the Check-Effects-Interactions pattern
- Update state before external calls

## Gas Optimization

### 1. Minimize Storage Operations
- Batch updates when possible
- Avoid unnecessary reads/writes

### 2. Use Efficient Data Structures
- Maps for key-value lookups
- Tuples for structured data
- Avoid deeply nested structures

### 3. Minimize Computation
- Cache expensive calculations
- Use built-in functions when available

## Testing Considerations

### 1. Include Test Functions
```clarity
;; Test function (not for production)
(define-public (test-function)
  (ok true)
)
```

### 2. Include Debug Information
```clarity
;; Debug comment explaining complex logic
```

## Reference Contracts

Refer to these standardized contracts for examples:
- `template.clar`: Standard contract template
- `sbtc-marketplace.clar`: sBTC P2P Marketplace contract

## SIP References

When relevant, reference these Stacks Improvement Proposals:
- SIP-009: Non-Fungible Token Standard
- SIP-010: Fungible Token Standard
- SIP-012: NFT Royalty Standard
- SIP-013: NFT Metadata Standard
- SIP-014: NFT Royalty Token Standard

Always follow the patterns and standards defined in these SIPs when implementing related functionality.