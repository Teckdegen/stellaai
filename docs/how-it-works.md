# How Stella AI Works

This document explains the complete flow of how Stella AI generates, validates, and deploys Clarity smart contracts.

## Single File Generation

Stella AI follows a strict single-file generation model:

1. **One Contract, One File**: Every Clarity smart contract is contained in a single `.clar` file
2. **Complete Implementation**: The AI generates the entire contract in one response
3. **Standards Compliance**: All SIP standards (SIP-009, SIP-010, etc.) are implemented within this single file
4. **No External Dependencies**: Contracts don't rely on external libraries or imports

## The Generation Flow

### 1. User Request
- User describes what they want to build in natural language
- Example: "Create an NFT contract with minting and SIP-009 compliance"

### 2. AI Processing
- The request is sent to Groq's Llama 3.3 70b model
- The AI uses a comprehensive system prompt with Clarity best practices
- The AI generates a complete, standards-compliant Clarity contract

### 3. Code Delivery
- The AI outputs ONLY the Clarity code (no markdown, no explanations mixed in)
- The code is delivered directly to the code editor
- Example output:
```clarity
;; NFT Contract
(define-non-fungible-token nft-token uint)
(define-constant ERR-NOT-AUTHORIZED u1)
;; ... rest of the contract
```

### 4. Real-time Validation
- As soon as code is generated, the built-in validator checks it:
  - Syntax validation (parentheses, naming, declarations)
  - Semantic validation (error handling, authorization)
  - Best practice validation (security, efficiency)
  - Standards compliance (SIP-009, SIP-010)

### 5. Storage
- The code is automatically saved to the project's `clarFile` property
- All project data is stored in the browser's localStorage
- No server-side storage of contract code

## Deployment Process

### 1. Code Preparation
- The entire contents of the editor are prepared for deployment
- Final validation checks are performed
- User must connect their Stacks wallet

### 2. Wallet Integration
- Deployment uses `openContractDeploy` from `@stacks/connect`
- All signing happens in the user's wallet (Hiro or Xverse)
- No private keys are ever exposed to the application

### 3. Blockchain Deployment
- The single Clarity file is deployed to the Stacks blockchain
- Contract name is derived from the project name
- Network (testnet/mainnet) is respected

## Key Principles

### Single Responsibility
- One project = One contract = One file
- This ensures maximum compatibility with Stacks deployment requirements
- Simplifies contract management and deployment

### Direct-to-Editor Delivery
- AI-generated code goes directly to the editor with no intermediaries
- Users can see exactly what the AI produced
- Manual editing is supported at any time

### Validation Before Deployment
- Multiple layers of validation prevent deployment of invalid code
- Errors block deployment
- Warnings are displayed for review

### Secure Deployment
- Private keys never leave the user's wallet
- All signing happens client-side
- No server has access to sensitive information

## Example Workflow

1. **User**: "Create an NFT contract with minting"
2. **AI**: Generates complete SIP-009 compliant contract in single file
3. **System**: Validates code for syntax, semantics, and best practices
4. **User**: Reviews code in editor, makes optional modifications
5. **User**: Connects wallet and clicks "Deploy"
6. **Wallet**: Prompts user to sign deployment transaction
7. **Blockchain**: Contract is deployed as single file to Stacks

This single-file approach ensures that:
- Contracts are self-contained and portable
- Deployment is simple and reliable
- Users have complete control over their code
- Security is maximized through wallet-based signing
- Standards compliance is maintained