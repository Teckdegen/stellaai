;; Example of a valid Clarity contract for testing validation
(define-data-var counter uint u0)
(define-constant ERR-NOT-AUTHORIZED u1)

(define-public (increment)
  (begin
    (asserts! (is-eq tx-sender (contract-call? .owner get-owner)) (err ERR-NOT-AUTHORIZED))
    (var-set counter (+ (var-get counter) u1))
    (ok true)
  )
)

(define-public (get-counter)
  (ok (var-get counter))
)

(define-read-only (is-authorized)
  (ok (is-eq tx-sender (contract-call? .owner get-owner)))
)