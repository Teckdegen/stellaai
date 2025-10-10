;; sBTC P2P Marketplace Contract

;; Contract Header
;; ===============================================

;; Data Variables
(define-data-var listing-counter uint u0)

;; Data Maps
(define-map listings
  uint
  {
    seller: principal,
    amount: uint,
    price: uint,
    active: bool
  }
)

;; Error Codes
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-already-sold (err u400))

;; Public Functions
;; ===============================================

;; Create listing
(define-public (create-listing (amount uint) (price uint))
  (let ((id (+ (var-get listing-counter) u1)))
    (map-set listings id {
      seller: tx-sender,
      amount: amount,
      price: price,
      active: true
    })
    (var-set listing-counter id)
    (ok id)
  )
)

;; Mark as sold (seller or buyer can mark)
(define-public (mark-sold (id uint))
  (let ((listing (unwrap! (map-get? listings id) err-not-found)))
    (asserts! (get active listing) err-already-sold)
    (map-set listings id (merge listing { active: false }))
    (ok true)
  )
)

;; Cancel listing (only seller can cancel)
(define-public (cancel-listing (id uint))
  (let ((listing (unwrap! (map-get? listings id) err-not-found)))
    (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)
    (asserts! (get active listing) err-already-sold)
    (map-set listings id (merge listing { active: false }))
    (ok true)
  )
)

;; Update listing price (only seller can update, only if active)
(define-public (update-price (id uint) (new-price uint))
  (let ((listing (unwrap! (map-get? listings id) err-not-found)))
    (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)
    (asserts! (get active listing) err-already-sold)
    (map-set listings id (merge listing { price: new-price }))
    (ok true)
  )
)

;; Read-only Functions
;; ===============================================

;; Get listing by ID
(define-read-only (get-listing (id uint))
  (map-get? listings id)
)

;; Get the listing counter value
(define-read-only (get-count)
  (var-get listing-counter)
)