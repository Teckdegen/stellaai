;; Example of a valid Clarity contract for testing validation

;; Contract Header
;; ===============================================

;; Data Variables
(define-data-var counter uint u0)

;; Constants
(define-constant owner 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM) ;; Example owner address

;; Error Codes
(define-constant err-not-authorized (err u1))

;; Public Functions
;; ===============================================

(define-public (increment)
  (begin
    (asserts! (is-eq tx-sender owner) err-not-authorized)
    (var-set counter (+ (var-get counter) u1))
    (ok true)
  )
)

(define-public (get-counter)
  (ok (var-get counter))
)

(define-read-only (is-authorized)
  (ok (is-eq tx-sender owner))
)