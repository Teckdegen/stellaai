import { NextRequest } from "next/server"

// Get API key from environment variable or source code
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "your-gemini-api-key-here"

export async function POST(req: NextRequest) {
  // Check if API key is configured
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key-here") {
    console.error("Gemini API key not configured")
    return new Response(
      JSON.stringify({ 
        error: "Gemini API key not configured. Please add your Gemini API key to the environment variables or source code." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  try {
    const body = await req.json()
    const { messages, contractName, network, currentCode, codebaseContext } = body

    // Enhanced system prompt with detailed codebase context
    const systemPrompt = `You are Clarity AI, an expert AI assistant for Clarity smart contract development on the Stacks blockchain.

${codebaseContext || "Codebase context not provided."}

Current Project Details:
- Contract Name: ${contractName || "unnamed-contract"}
- Network: ${network || "testnet"}
- Current Code: ${currentCode ? `\n\`\`\`clarity\n${currentCode}\n\`\`\`` : "No code yet"}

# Universal Clarity Smart Contract Development Guide
## Complete Reference for Error-Free Contract Development

> **Version**: 2.0 | **Last Updated**: 2025 | **Stacks Blockchain Standard**
> 
> This comprehensive guide covers every aspect of Clarity development with a focus on preventing common errors, following Stacks standards, and writing production-ready smart contracts.

## Table of Contents

1. [Quick Start & Contract Structure](#1-quick-start--contract-structure)
2. [Complete Syntax Reference](#2-complete-syntax-reference)
3. [Data Types Deep Dive](#3-data-types-deep-dive)
4. [Variable & Storage Patterns](#4-variable--storage-patterns)
5. [Function Development Guide](#5-function-development-guide)
6. [Error Handling Mastery](#6-error-handling-mastery)
7. [STX & Token Operations](#7-stx--token-operations)
8. [Access Control & Security](#8-access-control--security)
9. [Common Errors & Solutions](#9-common-errors--solutions)
10. [Advanced Patterns](#10-advanced-patterns)
11. [Testing & Debugging](#11-testing--debugging)
12. [Gas Optimization](#12-gas-optimization)
13. [Deployment Checklist](#13-deployment-checklist)
14. [Complete Code Examples](#14-complete-code-examples)

## 1. Quick Start & Contract Structure

### 1.1 Minimal Valid Contract

\`\`\`clarity
;; Contract: minimal-example
;; Description: The simplest valid Clarity contract

(define-constant contract-owner tx-sender)

(define-read-only (get-owner)
  (ok contract-owner))
\`\`\`

### 1.2 Standard Contract Template

\`\`\`clarity
;; Contract: standard-template
;; Version: 1.0.0
;; Description: Standard template with all essential components

;; ============================================
;; CONSTANTS
;; ============================================
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))
(define-constant err-not-found (err u101))
(define-constant err-invalid-input (err u102))

;; ============================================
;; DATA VARIABLES
;; ============================================
(define-data-var contract-paused bool false)
(define-data-var total-supply uint u0)

;; ============================================
;; DATA MAPS
;; ============================================
(define-map balances principal uint)

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================
(define-private (is-owner)
  (is-eq tx-sender contract-owner))

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================
(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? balances account))))

(define-read-only (is-paused)
  (ok (var-get contract-paused)))

;; ============================================
;; PUBLIC FUNCTIONS
;; ============================================
(define-public (pause)
  (begin
    (asserts! (is-owner) err-unauthorized)
    (var-set contract-paused true)
    (ok true)))

(define-public (unpause)
  (begin
    (asserts! (is-owner) err-unauthorized)
    (var-set contract-paused false)
    (ok true)))
\`\`\`

### 1.3 Contract Organization Best Practices

\`\`\`clarity
;; ============================================
;; SECTION 1: HEADER & METADATA
;; ============================================
;; Contract name, version, description
;; Author, license information

;; ============================================
;; SECTION 2: TRAITS & IMPORTS
;; ============================================
;; (impl-trait .trait-name.trait-definition)
;; (use-trait token-trait .sip-010-trait.sip-010-trait)

;; ============================================
;; SECTION 3: CONSTANTS
;; ============================================
;; Error codes (u100+)
;; Configuration constants
;; Role definitions

;; ============================================
;; SECTION 4: DATA VARIABLES
;; ============================================
;; Mutable state variables
;; Always with initial values

;; ============================================
;; SECTION 5: DATA MAPS
;; ============================================
;; Key-value storage
;; Clear naming conventions

;; ============================================
;; SECTION 6: PRIVATE FUNCTIONS
;; ============================================
;; Internal helper functions
;; Validation functions
;; Calculation functions

;; ============================================
;; SECTION 7: READ-ONLY FUNCTIONS
;; ============================================
;; View functions
;; Getters
;; Query functions

;; ============================================
;; SECTION 8: PUBLIC FUNCTIONS
;; ============================================
;; State-changing functions
;; Main contract interface
;; Administrative functions
\`\`\`

## 2. Complete Syntax Reference

### 2.1 Variable Declaration Rules

#### ❌ WRONG - These Will Fail Deployment

\`\`\`clarity
;; ERROR: Missing initial value
(define-data-var counter uint)

;; ERROR: Wrong syntax
(define-data-var counter: uint u0)

;; ERROR: Using undefined type
(define-data-var amount number u100)

;; ERROR: Type mismatch
(define-data-var count uint false)

;; ERROR: Invalid principal
(define-data-var owner principal "ST1234")
\`\`\`

#### ✅ CORRECT - Proper Variable Declarations

\`\`\`clarity
;; Basic types
(define-data-var counter uint u0)
(define-data-var enabled bool true)
(define-data-var owner principal tx-sender)
(define-data-var name (string-ascii 50) "MyContract")

;; Optional types
(define-data-var admin (optional principal) none)
(define-data-var admin-set (optional principal) (some tx-sender))

;; Complex types
(define-data-var config 
  {
    fee-rate: uint,
    min-amount: uint,
    enabled: bool
  }
  {
    fee-rate: u300,
    min-amount: u1000000,
    enabled: true
  })

;; List types (must specify max length)
(define-data-var allowed-tokens (list 10 uint) (list))
\`\`\`

### 2.2 Constant Definition Rules

#### ✅ CORRECT Constant Patterns

\`\`\`clarity
;; Error codes - start from u100
(define-constant err-unauthorized (err u100))
(define-constant err-not-found (err u101))
(define-constant err-invalid-amount (err u102))
(define-constant err-insufficient-balance (err u103))
(define-constant err-already-exists (err u104))
(define-constant err-expired (err u105))
(define-constant err-not-enabled (err u106))

;; Configuration constants
(define-constant contract-owner tx-sender)
(define-constant min-transfer-amount u1000000) ;; 1 STX
(define-constant max-transfer-amount u100000000000) ;; 100,000 STX
(define-constant fee-denominator u10000) ;; For basis points
(define-constant seconds-per-day u144) ;; Blocks per day (10 min blocks)

;; Role constants
(define-constant admin-role "admin")
(define-constant minter-role "minter")
(define-constant pauser-role "pauser")

;; String constants
(define-constant token-name "MyToken")
(define-constant token-symbol "MTK")

;; List constants (max 1024 elements)
(define-constant valid-asset-ids (list u1 u2 u3 u4 u5))

;; Principal constants
(define-constant treasury-address 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
\`\`\`

### 2.3 Map Definition Patterns

#### Simple Maps

\`\`\`clarity
;; Principal to uint
(define-map balances principal uint)

;; Uint to principal
(define-map token-owners uint principal)

;; Principal to bool
(define-map authorized-users principal bool)

;; String to uint
(define-map name-to-id (string-ascii 50) uint)
\`\`\`

#### Complex Key Maps

\`\`\`clarity
;; Composite keys
(define-map allowances 
  {owner: principal, spender: principal}
  uint)

(define-map positions
  {user: principal, asset-id: uint}
  {amount: uint, entry-price: uint, timestamp: uint})

(define-map orders
  {order-id: uint, user: principal}
  {
    amount: uint,
    price: uint,
    order-type: (string-ascii 10),
    filled: bool
  })
\`\`\`

#### Complex Value Maps

\`\`\`clarity
;; Detailed user profiles
(define-map user-profiles
  principal
  {
    username: (string-ascii 50),
    bio: (string-utf8 500),
    reputation: uint,
    joined-at: uint,
    verified: bool,
    badges: (list 10 (string-ascii 20))
  })

;; NFT metadata
(define-map token-metadata
  uint
  {
    name: (string-ascii 100),
    uri: (string-ascii 256),
    owner: principal,
    minted-at: uint,
    attributes: (list 10 {trait-type: (string-ascii 50), value: (string-ascii 50)})
  })
\`\`\`

### 2.4 Function Definition Syntax

#### Public Functions (Complete Patterns)

\`\`\`clarity
;; Basic pattern
(define-public (function-name (param1 type1) (param2 type2))
  (ok return-value))

;; With validation
(define-public (transfer (to principal) (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (not (is-eq to tx-sender)) err-self-transfer)
    (try! (stx-transfer? amount tx-sender to))
    (ok true)))

;; With complex logic
(define-public (complex-operation (param uint))
  (let (
    (current-value (var-get some-var))
    (calculated (+ current-value param))
  )
    (asserts! (> calculated u0) err-invalid-result)
    (var-set some-var calculated)
    (print {event: "operation", value: calculated})
    (ok calculated)))

;; Multiple operations
(define-public (batch-process (items (list 10 uint)))
  (begin
    (asserts! (> (len items) u0) err-empty-list)
    (ok (map process-item items))))
\`\`\`

#### Read-Only Functions

\`\`\`clarity
;; Simple getter
(define-read-only (get-counter)
  (ok (var-get counter)))

;; With parameters
(define-read-only (get-balance (user principal))
  (ok (default-to u0 (map-get? balances user))))

;; With calculations
(define-read-only (calculate-fee (amount uint))
  (ok (/ (* amount u300) u10000)))

;; Complex queries
(define-read-only (get-user-stats (user principal))
  (let (
    (balance (default-to u0 (map-get? balances user)))
    (total (var-get total-supply))
  )
    (ok {
      balance: balance,
      percentage: (if (> total u0) (/ (* balance u10000) total) u0)
    })))
\`\`\`

#### Private Functions

\`\`\`clarity
;; Validation helpers
(define-private (is-valid-amount (amount uint))
  (and (> amount u0) (<= amount max-transfer-amount)))

(define-private (is-authorized (user principal))
  (or 
    (is-eq user contract-owner)
    (default-to false (map-get? authorized-users user))))

;; Calculation helpers
(define-private (calculate-percentage (amount uint) (rate uint))
  (/ (* amount rate) u10000))

(define-private (min (a uint) (b uint))
  (if (< a b) a b))

(define-private (max (a uint) (b uint))
  (if (> a b) a b))

;; Business logic helpers
(define-private (update-balance (user principal) (amount uint))
  (let ((current (default-to u0 (map-get? balances user))))
    (map-set balances user (+ current amount))))
\`\`\`

## 3. Data Types Deep Dive

### 3.1 Integer Types

#### Unsigned Integers (uint)

\`\`\`clarity
;; Definition: 128-bit unsigned integer (0 to 2^128-1)
;; Always prefix with 'u'

;; Valid uint values
u0
u1
u100
u1000000
u340282366920938463463374607431768211455  ;; Max uint

;; Common use cases
(define-constant stx-decimals u6)
(define-constant one-stx u1000000)  ;; 1 STX in microSTX
(define-constant one-hundred-stx u100000000)

;; Operations
(+ u10 u20)           ;; u30
(- u50 u20)           ;; u30
(* u10 u5)            ;; u50
(/ u100 u3)           ;; u33 (integer division)
(mod u100 u3)         ;; u1

;; Comparisons
(> u10 u5)            ;; true
(<= u10 u10)          ;; true
(is-eq u5 u5)         ;; true
\`\`\`

#### Signed Integers (int)

\`\`\`clarity
;; Definition: 128-bit signed integer (-2^127 to 2^127-1)
;; No prefix needed

;; Valid int values
0
-1
100
-100
170141183460469231731687303715884105727   ;; Max int
-170141183460469231731687303715884105728  ;; Min int

;; Use cases (less common in Clarity)
(define-private (calculate-profit (revenue int) (cost int))
  (- revenue cost))

;; Can be negative
(calculate-profit 100 150)  ;; -50
\`\`\`

### 3.2 Boolean Type

\`\`\`clarity
;; Only two values
true
false

;; Logical operations
(and true true)           ;; true
(or false true)           ;; true
(not true)                ;; false

;; Common patterns
(define-private (is-eligible (user principal))
  (and
    (>= (get-balance user) min-balance)
    (default-to false (map-get? verified-users user))
    (not (var-get contract-paused))))
\`\`\`

### 3.3 Principal Type

\`\`\`clarity
;; Definition: Stacks address or contract identifier

;; Standard principal (user address)
'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

;; Contract principal (includes contract name)
'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.my-contract

;; Special principals
tx-sender           ;; Transaction originator
contract-caller     ;; Immediate caller
(as-contract tx-sender)  ;; Contract's own address

;; Operations
(is-eq principal1 principal2)
(is-standard principal)  ;; Check if standard address
(principal-construct? version-byte hash-bytes)

;; Common usage
(define-private (is-contract-owner)
  (is-eq tx-sender contract-owner))

(define-read-only (get-contract-address)
  (ok (as-contract tx-sender)))
\`\`\`

### 3.4 Buffer Type

\`\`\`clarity
;; Fixed-length byte sequence
(define-constant hash-buffer (buff 32))

;; Examples
0x  ;; Empty buffer
0x1234
0xdeadbeef

;; Common uses
(define-map hashes principal (buff 32))

;; Operations
(len 0x1234)              ;; u2
(concat 0x12 0x34)        ;; 0x1234
(as-max-len? buffer u32)  ;; Ensure max length

;; Hashing (produces buffers)
(sha256 buffer)
(sha512 buffer)
(sha512/256 buffer)
(keccak256 buffer)
(hash160 buffer)
\`\`\`

### 3.5 String Types

#### ASCII Strings

\`\`\`clarity
;; Fixed maximum length
(define-data-var name (string-ascii 50) "MyToken")

;; Valid characters: ASCII printable (32-126)
"Hello World"
"ABC123!@#"

;; Operations
(len "hello")                    ;; u5
(concat "hello" " world")        ;; "hello world"
(as-max-len? "text" u10)        ;; Ensure max length

;; Common patterns
(define-constant token-name "MyToken")
(define-constant token-symbol "MTK")

(define-map usernames principal (string-ascii 50))
\`\`\`

#### UTF-8 Strings

\`\`\`clarity
;; Supports Unicode characters
(define-data-var message (string-utf8 200) u"Hello 世界 🌍")

;; Use u"..." prefix
u"Hello"
u"émojis: 😀🎉"
u"中文支持"

;; Same operations as ASCII strings
(len u"hello")
(concat u"hello" u" world")
\`\`\`

### 3.6 Optional Type

\`\`\`clarity
;; Definition: Value that may or may not exist

;; Creating optionals
none                              ;; No value
(some u100)                       ;; Has value u100
(some {name: "Alice", age: u30})  ;; Has tuple value

;; Common with map-get?
(map-get? balances user)  ;; Returns (optional uint)

;; Unwrapping optionals
(unwrap! (some u100) err-not-found)     ;; u100
(unwrap-panic (some u100))              ;; u100 (throws if none)
(default-to u0 (some u100))             ;; u100
(default-to u0 none)                    ;; u0

;; Pattern matching
(match (map-get? balances user)
  balance (ok balance)
  (err u404))

;; Checking for value
(is-some (some u100))  ;; true
(is-none none)         ;; true

;; Common patterns
(define-read-only (get-balance-safe (user principal))
  (ok (default-to u0 (map-get? balances user))))

(define-public (use-optional-value)
  (let ((maybe-value (map-get? data-map tx-sender)))
    (match maybe-value
      value (ok value)
      err-not-found)))
\`\`\`

### 3.7 Response Type

\`\`\`clarity
;; Definition: Result of operation (success or error)

;; Creating responses
(ok u100)           ;; Success with value
(err u404)          ;; Error with code
(ok true)           ;; Success with boolean
(err "failed")      ;; Error with message

;; All public functions MUST return response
(define-public (my-function)
  (ok true))  ;; Required

;; Unwrapping responses
(try! (stx-transfer? u100 tx-sender recipient))
(unwrap! (some-function) err-failed)

;; Pattern matching
(match (some-function)
  success-value (ok success-value)
  error-value (err error-value))

;; Checking response type
(is-ok (ok u100))    ;; true
(is-err (err u404))  ;; true

;; Common patterns
(define-public (safe-operation (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (try! (stx-transfer? amount tx-sender recipient))
    (ok true)))
\`\`\`

### 3.8 Tuple Type

\`\`\`clarity
;; Definition: Named collection of values

;; Creating tuples
{name: "Alice", age: u30}
{x: u10, y: u20, z: u30}
{
  user: tx-sender,
  amount: u1000000,
  timestamp: block-height,
  processed: false
}

;; Accessing tuple fields
(get name {name: "Alice", age: u30})  ;; "Alice"
(get age {name: "Alice", age: u30})   ;; u30

;; Merging tuples
(merge 
  {name: "Alice", age: u30}
  {age: u31, city: "NYC"})
;; Result: {name: "Alice", age: u31, city: "NYC"}

;; Common usage in maps
(define-map users
  principal
  {
    balance: uint,
    joined-at: uint,
    verified: bool
  })

;; Updating tuple in map
(let ((user-data (unwrap! (map-get? users tx-sender) err-not-found)))
  (map-set users tx-sender 
    (merge user-data {balance: u1000000})))

;; Return tuple from function
(define-read-only (get-stats)
  (ok {
    total-users: (var-get user-count),
    total-supply: (var-get total-supply),
    contract-balance: (stx-get-balance (as-contract tx-sender))
  }))
\`\`\`

### 3.9 List Type

\`\`\`clarity
;; Definition: Ordered collection with fixed maximum length

;; Creating lists (always specify max length)
(list u1 u2 u3)
(list principal1 principal2 principal3)
(list)  ;; Empty list

;; Maximum length: 1024 elements
(define-data-var allowed-users (list 100 principal) (list))

;; List operations
(len (list u1 u2 u3))           ;; u3
(append (list u1 u2) u3)        ;; (some (list u1 u2 u3))
(concat (list u1 u2) (list u3)) ;; (list u1 u2 u3)

;; as-max-len? - Ensure list doesn't exceed length
(as-max-len? (list u1 u2 u3) u10)  ;; (some (list u1 u2 u3))
(as-max-len? (list u1 u2 u3) u2)   ;; none

;; Element access
(element-at (list u10 u20 u30) u0)  ;; (some u10)
(element-at (list u10 u20 u30) u5)  ;; none

;; index-of - Find element
(index-of (list u10 u20 u30) u20)  ;; (some u1)

;; Higher-order functions
(map add-one (list u1 u2 u3))        ;; Transform each element
(filter is-even (list u1 u2 u3 u4))  ;; Keep matching elements
(fold + (list u1 u2 u3) u0)          ;; Reduce to single value

;; Practical examples
(define-private (add-one (x uint))
  (+ x u1))

(define-private (is-even (x uint))
  (is-eq (mod x u2) u0))

(define-read-only (sum-list (numbers (list 100 uint)))
  (ok (fold + numbers u0)))

(define-public (batch-transfer (recipients (list 10 principal)) (amounts (list 10 uint)))
  (begin
    (asserts! (is-eq (len recipients) (len amounts)) err-length-mismatch)
    (ok (map transfer-to recipients amounts))))
\`\`\`

## 4. Variable & Storage Patterns

### 4.1 Data Variable Patterns

#### Simple State Variables

\`\`\`clarity
;; Counter
(define-data-var counter uint u0)

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

;; Toggle
(define-data-var is-enabled bool true)

(define-public (toggle)
  (begin
    (var-set is-enabled (not (var-get is-enabled)))
    (ok (var-get is-enabled))))

;; Owner
(define-data-var owner principal tx-sender)

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) err-unauthorized)
    (var-set owner new-owner)
    (ok true)))
\`\`\`

#### Complex State Variables

\`\`\`clarity
;; Configuration tuple
(define-data-var config
  {
    fee-rate: uint,
    min-amount: uint,
    max-amount: uint,
    enabled: bool
  }
  {
    fee-rate: u300,
    min-amount: u1000000,
    max-amount: u100000000000,
    enabled: true
  })

(define-public (update-fee-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (<= new-rate u1000) err-invalid-rate)
    (var-set config (merge (var-get config) {fee-rate: new-rate}))
    (ok true)))

;; Optional admin
(define-data-var admin (optional principal) none)

(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set admin (some new-admin))
    (ok true)))

(define-public (remove-admin)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set admin none)
    (ok true)))
\`\`\`

### 4.2 Map Storage Patterns

#### Balance Tracking

\`\`\`clarity
;; Simple balance
(define-map balances principal uint)

(define-private (add-balance (user principal) (amount uint))
  (let ((current (default-to u0 (map-get? balances user))))
    (map-set balances user (+ current amount))))

(define-private (subtract-balance (user principal) (amount uint))
  (let ((current (default-to u0 (map-get? balances user))))
    (begin
      (asserts! (>= current amount) err-insufficient-balance)
      (if (is-eq current amount)
        (map-delete balances user)
        (map-set balances user (- current amount)))
      (ok true))))

;; Multi-asset balance
(define-map multi-balances
  {user: principal, asset-id: uint}
  uint)

(define-read-only (get-asset-balance (user principal) (asset-id uint))
  (ok (default-to u0 
    (map-get? multi-balances {user: user, asset-id: asset-id}))))
\`\`\`

#### Allowance/Approval Patterns

\`\`\`clarity
;; ERC20-style allowance
(define-map allowances
  {owner: principal, spender: principal}
  uint)

(define-public (approve (spender principal) (amount uint))
  (begin
    (map-set allowances {owner: tx-sender, spender: spender} amount)
    (print {event: "approval", owner: tx-sender, spender: spender, amount: amount})
    (ok true)))

(define-public (increase-allowance (spender principal) (amount uint))
  (let ((current (default-to u0 
          (map-get? allowances {owner: tx-sender, spender: spender}))))
    (map-set allowances 
      {owner: tx-sender, spender: spender}
      (+ current amount))
    (ok true)))

(define-read-only (get-allowance (owner principal) (spender principal))
  (ok (default-to u0 
    (map-get? allowances {owner: owner, spender: spender}))))
\`\`\`

#### Historical Data

\`\`\`clarity
;; Track changes over time
(define-map balance-history
  {user: principal, block: uint}
  uint)

(define-private (record-balance (user principal))
  (map-set balance-history
    {user: user, block: block-height}
    (default-to u0 (map-get? balances user))))

;; Checkpoint system
(define-map checkpoints
  {user: principal, checkpoint-id: uint}
  {balance: uint, timestamp: uint, block: uint})

(define-data-var checkpoint-counter uint u0)

(define-public (create-checkpoint)
  (let (
    (checkpoint-id (var-get checkpoint-counter))
    (balance (default-to u0 (map-get? balances tx-sender)))
  )
    (map-set checkpoints
      {user: tx-sender, checkpoint-id: checkpoint-id}
      {balance: balance, timestamp: block-height, block: block-height})
    (var-set checkpoint-counter (+ checkpoint-id u1))
    (ok checkpoint-id)))
\`\`\`

### 4.3 Enumeration Patterns

\`\`\`clarity
;; Track all users
(define-map user-exists principal bool)
(define-data-var user-count uint u0)
(define-map user-by-index uint principal)
(define-map user-index principal uint)

(define-private (add-user (user principal))
  (match (map-get? user-exists user)
    exists true  ;; Already exists
    (let ((index (var-get user-count)))
      (map-set user-exists user true)
      (map-set user-by-index index user)
      (map-set user-index user index)
      (var-set user-count (+ index u1))
      true)))

(define-read-only (get-user-at-index (index uint))
  (ok (map-get? user-by-index index)))

(define-read-only (get-total-users)
  (ok (var-get user-count)))

;; Iterate (in read-only context)
(define-read-only (get-users-batch (start uint) (limit uint))
  (ok (map get-user-at-index-safe 
    (generate-sequence start limit))))

(define-private (generate-sequence (start uint) (count uint))
  ;; Helper to generate list of indices
  (list start))  ;; Simplified
\`\`\`

## 5. Function Development Guide

### 5.1 Public Function Best Practices

#### Input Validation Template

\`\`\`clarity
(define-public (validated-transfer (recipient principal) (amount uint))
  (begin
    ;; Step 1: Validate caller
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    
    ;; Step 2: Validate parameters
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (<= amount max-transfer-amount) err-amount-too-high)
    (asserts! (not (is-eq recipient tx-sender)) err-self-transfer)
    (asserts! (is-standard recipient) err-invalid-recipient)
    
    ;; Step 3: Check state
    (let ((sender-balance (default-to u0 (map-get? balances tx-sender))))
      (asserts! (>= sender-balance amount) err-insufficient-balance)
      
      ;; Step 4: Execute operations
      (map-set balances tx-sender (- sender-balance amount))
      (map-set balances recipient 
        (+ (default-to u0 (map-get? balances recipient)) amount))
      
      ;; Step 5: Emit events
      (print {
        event: "transfer",
        sender: tx-sender,
        recipient: recipient,
        amount: amount,
        block: block-height
      })
      
      ;; Step 6: Return success
      (ok true))))

;; Multiple return values pattern
(define-public (swap-tokens (amount-in uint))
  (let (
    (fee (calculate-fee amount-in))
    (amount-out (- amount-in fee))
  )
    (try! (stx-transfer? amount-in tx-sender (as-contract tx-sender)))
    (ok {
      amount-in: amount-in,
      amount-out: amount-out,
      fee: fee
    })))
\`\`\`

#### State Modification Patterns

\`\`\`clarity
;; Pattern 1: Read-Modify-Write
(define-public (increment-balance (amount uint))
  (let ((current (default-to u0 (map-get? balances tx-sender))))
    (map-set balances tx-sender (+ current amount))
    (ok (+ current amount))))

;; Pattern 2: Conditional Update
(define-public (conditional-update (threshold uint))
  (let ((current (default-to u0 (map-get? balances tx-sender))))
    (if (>= current threshold)
      (begin
        (map-set balances tx-sender (* current u2))
        (ok "doubled"))
      (ok "no change"))))

;; Pattern 3: Multi-Step Update
(define-public (complex-update (amount uint))
  (let (
    (old-balance (default-to u0 (map-get? balances tx-sender)))
    (new-balance (+ old-balance amount))
    (total (var-get total-supply))
  )
    ;; Update balance
    (map-set balances tx-sender new-balance)
    
    ;; Update total
    (var-set total-supply (+ total amount))
    
    ;; Update metadata
    (map-set last-update tx-sender block-height)
    
    (ok {old: old-balance, new: new-balance})))

;; Pattern 4: Atomic Multi-User Update
(define-public (atomic-swap (counterparty principal) (amount uint))
  (let (
    (my-balance (default-to u0 (map-get? balances tx-sender)))
    (their-balance (default-to u0 (map-get? balances counterparty)))
  )
    (asserts! (>= my-balance amount) err-insufficient-balance)
    (asserts! (>= their-balance amount) err-counterparty-insufficient)
    
    ;; Both updates or neither
    (map-set balances tx-sender (+ (- my-balance amount) amount))
    (map-set balances counterparty (+ (- their-balance amount) amount))
    
    (ok true)))
\`\`\`

### 5.2 Read-Only Function Patterns

#### View Functions

\`\`\`clarity
;; Simple getter
(define-read-only (get-balance (user principal))
  (ok (default-to u0 (map-get? balances user))))

;; Computed value
(define-read-only (get-balance-with-interest (user principal))
  (let (
    (balance (default-to u0 (map-get? balances user)))
    (last-update (default-to u0 (map-get? last-update-block user)))
    (blocks-passed (- block-height last-update))
    (interest (/ (* balance blocks-passed) u1000000))
  )
    (ok (+ balance interest))))

;; Multiple values
(define-read-only (get-account-info (user principal))
  (ok {
    balance: (default-to u0 (map-get? balances user)),
    allowance: (default-to u0 
      (map-get? allowances {owner: user, spender: tx-sender})),
    last-update: (default-to u0 (map-get? last-update-block user)),
    is-verified: (default-to false (map-get? verified-users user))
  }))

;; Aggregation
(define-read-only (get-total-balance (users (list 10 principal)))
  (ok (fold + (map get-balance-internal users) u0)))

(define-private (get-balance-internal (user principal))
  (default-to u0 (map-get? balances user)))
\`\`\`

#### Query Functions

\`\`\`clarity
;; Existence checks
(define-read-only (user-exists (user principal))
  (ok (is-some (map-get? balances user))))

(define-read-only (has-allowance (owner principal) (spender principal))
  (ok (> (default-to u0 
    (map-get? allowances {owner: owner, spender: spender})) u0)))

;; Comparison queries
(define-read-only (is-balance-greater-than (user principal) (threshold uint))
  (ok (>= (default-to u0 (map-get? balances user)) threshold)))

(define-read-only (can-afford (user principal) (amount uint))
  (let ((balance (default-to u0 (map-get? balances user))))
    (ok (>= balance amount))))

;; Complex queries
(define-read-only (get-user-status (user principal))
  (let (
    (balance (default-to u0 (map-get? balances user)))
    (is-verified (default-to false (map-get? verified-users user)))
    (tier (if (>= balance u100000000) 
            "gold" 
            (if (>= balance u10000000) "silver" "bronze")))
  )
    (ok {
      balance: balance,
      verified: is-verified,
      tier: tier,
      can-trade: (and is-verified (>= balance u1000000))
    })))
\`\`\`

### 5.3 Private Function Patterns

#### Validation Helpers

\`\`\`clarity
;; Boolean checks
(define-private (is-valid-amount (amount uint))
  (and (> amount u0) (<= amount max-transfer-amount)))

(define-private (is-authorized (user principal))
  (or 
    (is-eq user contract-owner)
    (default-to false (map-get? authorized-users user))))

(define-private (is-within-limits (amount uint))
  (let ((config (var-get config)))
    (and 
      (>= amount (get min-amount config))
      (<= amount (get max-amount config)))))

;; Complex validation
(define-private (validate-transfer (sender principal) (recipient principal) (amount uint))
  (and
    (not (is-eq sender recipient))
    (is-valid-amount amount)
    (>= (default-to u0 (map-get? balances sender)) amount)
    (not (var-get contract-paused))))

;; With error reporting
(define-private (check-transfer-requirements (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (not (var-get contract-paused)) err-paused)
    (asserts! (>= (default-to u0 (map-get? balances tx-sender)) amount) 
      err-insufficient-balance)
    (ok true)))
\`\`\`

#### Calculation Helpers

\`\`\`clarity
;; Math operations
(define-private (calculate-fee (amount uint))
  (/ (* amount (var-get fee-rate)) u10000))

(define-private (calculate-percentage (amount uint) (percentage uint))
  (/ (* amount percentage) u100))

(define-private (safe-multiply (a uint) (b uint) (divisor uint))
  (/ (* a b) divisor))

;; Bounds checking
(define-private (clamp (value uint) (min-val uint) (max-val uint))
  (if (< value min-val)
    min-val
    (if (> value max-val)
      max-val
      value)))

(define-private (min (a uint) (b uint))
  (if (< a b) a b))

(define-private (max (a uint) (b uint))
  (if (> a b) a b))

;; Financial calculations
(define-private (calculate-compound-interest (principal uint) (rate uint) (periods uint))
  ;; Simplified compound interest
  (if (is-eq periods u0)
    principal
    (let ((interest (/ (* principal rate) u10000)))
      (calculate-compound-interest (+ principal interest) rate (- periods u1)))))
\`\`\`

#### State Management Helpers

\`\`\`clarity
;; Safe balance updates
(define-private (increase-balance (user principal) (amount uint))
  (let ((current (default-to u0 (map-get? balances user))))
    (map-set balances user (+ current amount))))

(define-private (decrease-balance (user principal) (amount uint))
  (let ((current (default-to u0 (map-get? balances user))))
    (if (>= current amount)
      (begin
        (if (is-eq current amount)
          (map-delete balances user)
          (map-set balances user (- current amount)))
        (ok true))
      err-insufficient-balance)))

;; Conditional operations
(define-private (update-if-exists (user principal) (amount uint))
  (match (map-get? balances user)
    current-balance 
      (begin
        (map-set balances user (+ current-balance amount))
        (ok true))
    (ok false)))  ;; User doesn't exist, no update

;; Batch operations
(define-private (transfer-to (recipient principal) (amount uint))
  (stx-transfer? amount tx-sender recipient))

(define-private (process-item (item uint))
  (+ item u1))
\`\`\`

## 6. Error Handling Mastery

### 6.1 Error Code Standards

\`\`\`clarity
;; ============================================
;; STANDARD ERROR CODE RANGES
;; ============================================

;; 100-199: Authorization & Access Control
(define-constant err-unauthorized (err u100))
(define-constant err-not-owner (err u101))
(define-constant err-not-admin (err u102))
(define-constant err-forbidden (err u103))
(define-constant err-not-whitelisted (err u104))

;; 200-299: Input Validation
(define-constant err-invalid-amount (err u200))
(define-constant err-invalid-address (err u201))
(define-constant err-invalid-parameter (err u202))
(define-constant err-out-of-bounds (err u203))
(define-constant err-invalid-length (err u204))
(define-constant err-zero-amount (err u205))

;; 300-399: State Errors
(define-constant err-not-found (err u300))
(define-constant err-already-exists (err u301))
(define-constant err-insufficient-balance (err u302))
(define-constant err-insufficient-allowance (err u303))
(define-constant err-contract-paused (err u304))
(define-constant err-deadline-passed (err u305))

;; 400-499: Business Logic Errors
(define-constant err-transfer-failed (err u400))
(define-constant err-mint-failed (err u401))
(define-constant err-burn-failed (err u402))
(define-constant err-swap-failed (err u403))
(define-constant err-slippage-exceeded (err u404))

;; 500-599: System Errors
(define-constant err-overflow (err u500))
(define-constant err-underflow (err u501))
(define-constant err-division-by-zero (err u502))
(define-constant err-list-overflow (err u503))

;; 600-699: External Call Errors
(define-constant err-external-call-failed (err u600))
(define-constant err-token-transfer-failed (err u601))
(define-constant err-oracle-failed (err u602))
\`\`\`

### 6.2 Error Handling Patterns

#### Using try!

\`\`\`clarity
;; Basic try! usage
(define-public (transfer-with-try (recipient principal) (amount uint))
  (begin
    ;; If stx-transfer? returns (err ...), entire function returns that error
    (try! (stx-transfer? amount tx-sender recipient))
    (ok true)))

;; Multiple try! calls
(define-public (multi-transfer (recipient1 principal) (recipient2 principal) (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender recipient1))
    (try! (stx-transfer? amount tx-sender recipient2))
    (ok true)))

;; try! with function calls
(define-public (complex-operation (amount uint))
  (begin
    (try! (validate-amount amount))
    (try! (check-balance tx-sender amount))
    (try! (execute-transfer amount))
    (ok true)))

;; try! short-circuits on first error
(define-public (sequential-operations)
  (begin
    (try! (operation-1))  ;; If this fails, stops here
    (try! (operation-2))  ;; Only executes if operation-1 succeeds
    (try! (operation-3))  ;; Only executes if operation-2 succeeds
    (ok true)))
\`\`\`

#### Using unwrap!

\`\`\`clarity
;; Unwrap optional with custom error
(define-public (use-balance)
  (let (
    (balance (unwrap! (map-get? balances tx-sender) err-not-found))
  )
    (ok balance)))

;; Unwrap response with custom error
(define-public (unwrap-response)
  (let (
    (result (unwrap! (some-function) err-operation-failed))
  )
    (ok result)))

;; Chain unwraps
(define-public (chain-unwraps)
  (let (
    (user-data (unwrap! (map-get? users tx-sender) err-user-not-found))
    (balance (unwrap! (map-get? balances (get id user-data)) err-balance-not-found))
  )
    (ok balance)))

;; Unwrap with computation
(define-public (computed-unwrap (amount uint))
  (let (
    (balance (unwrap! (map-get? balances tx-sender) err-not-found))
    (new-balance (unwrap! (safe-add balance amount) err-overflow))
  )
    (map-set balances tx-sender new-balance)
    (ok new-balance)))
\`\`\`

#### Using unwrap-panic

\`\`\`clarity
;; ⚠️ WARNING: Only use when you're CERTAIN value exists
;; If value doesn't exist, transaction will abort

;; Safe usage: Constants or guaranteed values
(define-public (use-constant)
  (let (
    (admin (unwrap-panic (var-get admin-address)))  ;; Safe if always set
  )
    (ok admin)))

;; ❌ DANGEROUS: Don't use with user inputs
(define-public (dangerous-unwrap (user principal))
  (let (
    ;; DON'T DO THIS - will abort if user not found
    (balance (unwrap-panic (map-get? balances user)))
  )
    (ok balance)))

;; ✅ Better: Use unwrap! with error
(define-public (safe-unwrap (user principal))
  (let (
    (balance (unwrap! (map-get? balances user) err-not-found))
  )
    (ok balance)))
\`\`\`

#### Using default-to

\`\`\`clarity
;; Provide default for optional
(define-read-only (get-balance-safe (user principal))
  (ok (default-to u0 (map-get? balances user))))

;; Default for response (less common)
(define-read-only (get-value-safe)
  (default-to u0 (some-function-returning-response)))

;; Multiple defaults
(define-read-only (get-user-info (user principal))
  (ok {
    balance: (default-to u0 (map-get? balances user)),
    verified: (default-to false (map-get? verified-users user)),
    tier: (default-to "bronze" (map-get? user-tiers user))
  }))

;; ============================================
;; MULTI-ADMIN PATTERN
;; ============================================

(define-constant contract-owner tx-sender)
(define-map admins principal bool)

;; Initialize first admin
(map-set admins contract-owner true)

(define-private (is-admin-or-owner)
  (or 
    (is-eq tx-sender contract-owner)
    (default-to false (map-get? admins tx-sender))))

(define-public (add-admin (admin principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set admins admin true)
    (ok true)))

(define-public (remove-admin (admin principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (not (is-eq admin contract-owner)) err-cannot-remove-owner)
    (map-delete admins admin)
    (ok true)))

(define-public (admin-function)
  (begin
    (asserts! (is-admin-or-owner) err-unauthorized)
    ;; Admin logic
    (ok true)))

;; ============================================
;; ROLE-BASED ACCESS CONTROL (RBAC)
;; ============================================

(define-constant role-admin "admin")
(define-constant role-minter "minter")
(define-constant role-pauser "pauser")
(define-constant role-burner "burner")

(define-map roles {user: principal, role: (string-ascii 20)} bool)

;; Grant role
(define-public (grant-role (user principal) (role (string-ascii 20)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set roles {user: user, role: role} true)
    (print {event: "role-granted", user: user, role: role})
    (ok true)))

;; Revoke role
(define-public (revoke-role (user principal) (role (string-ascii 20)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-delete roles {user: user, role: role})
    (print {event: "role-revoked", user: user, role: role})
    (ok true)))

;; Check role
(define-read-only (has-role (user principal) (role (string-ascii 20)))
  (ok (default-to false (map-get? roles {user: user, role: role}))))

;; Require role
(define-private (require-role (role (string-ascii 20)))
  (asserts! (default-to false (map-get? roles {user: tx-sender, role: role})) 
    err-unauthorized))

;; Protected functions
(define-public (mint-tokens (amount uint) (recipient principal))
  (begin
    (try! (require-role role-minter))
    ;; Minting logic
    (ok true)))

(define-public (pause-contract)
  (begin
    (try! (require-role role-pauser))
    ;; Pause logic
    (ok true)))

;; ============================================
;; WHITELIST PATTERN
;; ============================================

(define-map whitelisted-users principal bool)
(define-data-var whitelist-enabled bool false)

(define-public (enable-whitelist)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set whitelist-enabled true)
    (ok true)))

(define-public (disable-whitelist)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set whitelist-enabled false)
    (ok true)))

(define-public (add-to-whitelist (user principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set whitelisted-users user true)
    (ok true)))

(define-public (remove-from-whitelist (user principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-delete whitelisted-users user)
    (ok true)))

(define-private (is-whitelisted (user principal))
  (or 
    (not (var-get whitelist-enabled))
    (default-to false (map-get? whitelisted-users user))))

(define-public (whitelisted-function)
  (begin
    (asserts! (is-whitelisted tx-sender) err-not-whitelisted)
    ;; Protected function logic
    (ok true)))

;; ============================================
;; BLACKLIST PATTERN
;; ============================================

(define-map blacklisted-users principal bool)

(define-public (add-to-blacklist (user principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set blacklisted-users user true)
    (print {event: "user-blacklisted", user: user})
    (ok true)))

(define-public (remove-from-blacklist (user principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-delete blacklisted-users user)
    (print {event: "user-unblacklisted", user: user})
    (ok true)))

(define-read-only (is-blacklisted (user principal))
  (ok (default-to false (map-get? blacklisted-users user))))

(define-private (check-not-blacklisted (user principal))
  (asserts! (not (default-to false (map-get? blacklisted-users user))) 
    err-blacklisted))

(define-public (safe-transfer (recipient principal) (amount uint))
  (begin
    (try! (check-not-blacklisted tx-sender))
    (try! (check-not-blacklisted recipient))
    (try! (stx-transfer? amount tx-sender recipient))
    (ok true)))

;; ============================================
;; COMBINED WHITELIST + BLACKLIST
;; ============================================

(define-private (is-allowed (user principal))
  (and 
    (is-whitelisted user)
    (not (default-to false (map-get? blacklisted-users user)))))

(define-public (protected-function)
  (begin
    (asserts! (is-allowed tx-sender) err-not-allowed)
    ;; Function logic
    (ok true)))

;; ============================================
;; TIME LOCKS
;; ============================================

(define-data-var unlock-height uint u0)

(define-public (set-time-lock (blocks uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set unlock-height (+ block-height blocks))
    (ok (var-get unlock-height))))

(define-private (is-unlocked)
  (>= block-height (var-get unlock-height)))

(define-public (time-locked-function)
  (begin
    (asserts! (is-unlocked) err-still-locked)
    ;; Function logic
    (ok true)))

;; ============================================
;; DEADLINE PATTERN
;; ============================================

(define-data-var deadline uint u0)

(define-public (set-deadline (block uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (> block block-height) err-invalid-deadline)
    (var-set deadline block)
    (ok true)))

(define-private (before-deadline)
  (< block-height (var-get deadline)))

(define-public (deadline-function)
  (begin
    (asserts! (before-deadline) err-deadline-passed)
    ;; Function logic
    (ok true)))

;; ============================================
;; SCHEDULED ACCESS
;; ============================================

(define-constant blocks-per-day u144)  ;; ~10 min blocks
(define-constant blocks-per-week (* blocks-per-day u7))

(define-data-var start-block uint u0)
(define-data-var end-block uint u0)

(define-public (set-schedule (start uint) (duration uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set start-block start)
    (var-set end-block (+ start duration))
    (ok true)))

(define-private (is-active)
  (and 
    (>= block-height (var-get start-block))
    (< block-height (var-get end-block))))

(define-public (scheduled-function)
  (begin
    (asserts! (is-active) err-not-active)
    ;; Function logic
    (ok true)))

;; ============================================
;; COOLDOWN PATTERN
;; ============================================

(define-map last-action-block principal uint)
(define-constant cooldown-period u144)  ;; 1 day

(define-private (can-act (user principal))
  (let ((last-block (default-to u0 (map-get? last-action-block user))))
    (>= (- block-height last-block) cooldown-period)))

(define-public (cooldown-function)
  (begin
    (asserts! (can-act tx-sender) err-cooldown-active)
    (map-set last-action-block tx-sender block-height)
    ;; Function logic
    (ok true)))

(define-read-only (get-remaining-cooldown (user principal))
  (let (
    (last-block (default-to u0 (map-get? last-action-block user)))
    (elapsed (- block-height last-block))
  )
    (if (>= elapsed cooldown-period)
      (ok u0)
      (ok (- cooldown-period elapsed)))))
\`\`\`
