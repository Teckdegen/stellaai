;; Example Clarity Smart Contract
;; This is a simple counter contract that demonstrates basic Clarity features

;; Define a data variable to store the counter value
(define-data-var counter uint u0)

;; Define a constant for the owner
(define-constant owner tx-sender)

;; Public function to get the current counter value
(define-public (get-counter)
  (ok (var-get counter))
)

;; Public function to increment the counter
;; Only the owner can call this function
(define-public (increment)
  (begin
    (asserts! (is-eq tx-sender owner) (err u1))
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))
  )
)

;; Public function to reset the counter to zero
;; Only the owner can call this function
(define-public (reset)
  (begin
    (asserts! (is-eq tx-sender owner) (err u1))
    (var-set counter u0)
    (ok (var-get counter))
  )
)

;; Read-only function to check if the caller is the owner
(define-read-only (is-owner)
  (ok (is-eq tx-sender owner))
)