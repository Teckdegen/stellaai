# Clarity Contract Standards

This document outlines the standardized structure and conventions for all Clarity smart contracts in this project.

## Contract Structure

All contracts should follow this standardized structure:

```
;; Contract Name

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

## Sections Explained

### Contract Header
- Brief description of the contract's purpose
- Section divider with `;; ===============================================`

### Constants
- Define all constants at the top of the contract
- Use descriptive names in kebab-case
- Example: `define-constant owner tx-sender`

### Error Codes
- Define all error codes with the `err-` prefix
- Use descriptive names that clearly indicate the error condition
- Use standard HTTP-like error codes when appropriate
- Example: `define-constant err-not-found (err u404)`

### Data Variables
- Define all data variables with descriptive names
- Use kebab-case for variable names
- Example: `define-data-var listing-counter uint u0`

### Data Maps
- Define all data maps with clear key-value structures
- Use descriptive map names
- Define complex types in the value tuple
- Example: 
```
(define-map listings
  uint
  {
    seller: principal,
    amount: uint,
    price: uint,
    active: bool
  }
)
```

### Traits
- Define traits for contract interfaces
- Use descriptive trait names
- Example: 
```
(define-trait nft-trait (
  (get-owner (uint) (response (optional principal) uint))
  (transfer (uint principal principal) (response bool uint))
))
```

### Public Functions
- Group all public functions together
- Use descriptive function names
- Include clear comments explaining the function's purpose
- Use proper error handling with `asserts!` and `unwrap!`
- Return appropriate response types `(ok ...)` or `(err ...)`

### Read-only Functions
- Group all read-only functions together
- Use the `define-read-only` keyword
- These functions should not modify state

### Update Functions
- Group functions that modify existing data together
- Include proper authorization checks
- Include state validation before updates

## Best Practices

1. **Error Handling**: Always use proper error handling with descriptive error codes
2. **Authorization**: Check `tx-sender` permissions before modifying data
3. **State Validation**: Validate state before making changes
4. **Comments**: Include clear comments explaining complex logic
5. **Naming**: Use consistent, descriptive naming conventions
6. **Structure**: Follow the standardized structure for all contracts

## Example Contract

See `template.clar` and `sbtc-marketplace.clar` for examples of contracts following these standards.