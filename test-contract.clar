;; counter.clar



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