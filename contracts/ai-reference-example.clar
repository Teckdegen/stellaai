;; AI Reference Example Contract
;; This contract demonstrates all Stacks blockchain standards and best practices

;; Contract Header
;; ===============================================

;; Constants
(define-constant owner tx-sender)
(define-constant fee-percentage uint 5) ;; 5% fee

;; Error Codes
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-invalid-state (err u400))
(define-constant err-insufficient-balance (err u402))
(define-constant err-already-exists (err u409))

;; Data Variables
(define-data-var item-counter uint u0)
(define-data-var total-fees uint u0)

;; Data Maps
(define-map items uint 
  {
    owner: principal,
    name: (string-ascii 50),
    price: uint,
    active: bool
  }
)

(define-map balances principal uint)

;; Traits
(define-trait token-trait (
  (transfer (principal principal uint) (response bool uint))
  (get-balance (principal) (response uint uint))
))

;; Public Functions
;; ===============================================

;; Create a new item for sale
(define-public (create-item (name (string-ascii 50)) (price uint))
  (begin
    (asserts! (> price u0) err-invalid-state)
    (let ((id (+ (var-get item-counter) u1)))
      (map-set items id {
        owner: tx-sender,
        name: name,
        price: price,
        active: true
      })
      (var-set item-counter id)
      (ok id)
    )
  )
)

;; Buy an item
(define-public (buy-item (id uint) (payment-token <token-trait>))
  (let ((item (unwrap! (map-get? items id) err-not-found)))
    (asserts! (get active item) err-invalid-state)
    (asserts! (not (is-eq tx-sender (get owner item))) err-unauthorized)
    
    ;; Calculate fee and transfer amounts
    (let ((price (get price item)))
      (let ((fee (/ (* price fee-percentage) u100)))
        (let ((seller-amount (- price fee)))
          ;; Transfer fee to contract owner
          (try! (contract-call? payment-token transfer tx-sender owner fee))
          
          ;; Transfer amount to seller
          (try! (contract-call? payment-token transfer tx-sender (get owner item) seller-amount))
          
          ;; Update item status
          (map-set items id (merge item { active: false }))
          
          ;; Update total fees
          (var-set total-fees (+ (var-get total-fees) fee))
          
          (ok true)
        )
      )
    )
  )
)

;; Cancel an item listing (only owner can cancel)
(define-public (cancel-item (id uint))
  (let ((item (unwrap! (map-get? items id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner item)) err-unauthorized)
    (asserts! (get active item) err-invalid-state)
    
    (map-set items id (merge item { active: false }))
    (ok true)
  )
)

;; Update item price (only owner can update, only if active)
(define-public (update-price (id uint) (new-price uint))
  (let ((item (unwrap! (map-get? items id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner item)) err-unauthorized)
    (asserts! (get active item) err-invalid-state)
    (asserts! (> new-price u0) err-invalid-state)
    
    (map-set items id (merge item { price: new-price }))
    (ok true)
  )
)

;; Read-only Functions
;; ===============================================

;; Get item details
(define-read-only (get-item (id uint))
  (map-get? items id)
)

;; Get item counter value
(define-read-only (get-item-count)
  (var-get item-counter)
)

;; Get total fees collected
(define-read-only (get-total-fees)
  (var-get total-fees)
)

;; Get user balance
(define-read-only (get-user-balance (user principal))
  (default-to u0 (map-get? balances user))
)

;; Check if user is contract owner
(define-read-only (is-contract-owner)
  (ok (is-eq tx-sender owner))
)

;; Update Functions
;; ===============================================

;; Withdraw fees (only owner can withdraw)
(define-public (withdraw-fees)
  (begin
    (asserts! (is-eq tx-sender owner) err-unauthorized)
    (asserts! (> (var-get total-fees) u0) err-insufficient-balance)
    
    (var-set total-fees u0)
    (ok true)
  )
)