;; Demo Clarity Smart Contract
;; This contract demonstrates various Clarity features and best practices

;; Constants
(define-constant owner tx-sender)
(define-constant ERR-NOT-AUTHORIZED u1)
(define-constant ERR-ALREADY-MINTED u2)
(define-constant ERR-NOT-FOUND u3)

;; Data Variables
(define-data-var counter uint u0)
(define-data-var is-paused bool false)

;; Maps
(define-map tokens uint (tuple (owner principal)))
(define-map balances principal uint)
(define-map approved principal (optional principal))

;; Traits
(define-trait nft-trait (
  (get-owner (uint) (response (optional principal) uint))
  (transfer (uint principal principal) (response bool uint))
))

;; Public Functions

;; Get the current counter value
(define-public (get-counter)
  (ok (var-get counter))
)

;; Increment the counter (owner only)
(define-public (increment)
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (var-get is-paused)) (err u100))
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))
  )
)

;; Reset the counter to zero (owner only)
(define-public (reset)
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-AUTHORIZED))
    (var-set counter u0)
    (ok (var-get counter))
  )
)

;; Pause/unpause the contract (owner only)
(define-public (set-pause (pause bool))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-AUTHORIZED))
    (var-set is-paused pause)
    (ok true)
  )
)

;; Mint a new token
(define-public (mint (token-id uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (map-insert tokens token-id {owner: tx-sender})) (err ERR-ALREADY-MINTED))
    (map-set balances tx-sender (+ (default-to u0 (map-get? balances tx-sender)) u1))
    (ok token-id)
  )
)

;; Get token owner
(define-public (get-owner (token-id uint))
  (ok (get owner (map-get? tokens token-id)))
)

;; Transfer token to another principal
(define-public (transfer (token-id uint) (to principal))
  (let
    (
      (owner-opt (map-get? tokens token-id))
    )
    (asserts! (is-some owner-opt) (err ERR-NOT-FOUND))
    (let
      (
        (owner (unwrap! owner-opt (err ERR-NOT-FOUND)))
      )
      (asserts! (is-eq tx-sender owner) (err ERR-NOT-AUTHORIZED))
      (map-set tokens token-id {owner: to})
      (map-set balances owner (- (default-to u0 (map-get? balances owner)) u1))
      (map-set balances to (+ (default-to u0 (map-get? balances to)) u1))
      (ok true)
    )
  )
)

;; Check if caller is the owner
(define-read-only (is-owner)
  (ok (is-eq tx-sender (var-get owner)))
)

;; Check if contract is paused
(define-read-only (is-contract-paused)
  (ok (var-get is-paused))
)

;; Get balance of a principal
(define-read-only (get-balance (who principal))
  (ok (default-to u0 (map-get? balances who)))
)