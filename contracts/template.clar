;; Contract Name

;; Contract Header
;; ===============================================

;; Constants
(define-constant owner tx-sender)

;; Error Codes
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u403))
(define-constant err-invalid-state (err u400))

;; Data Variables
(define-data-var counter uint u0)

;; Data Maps
(define-map items uint {owner: principal, active: bool})

;; Traits
;; (define-trait example-trait (
;;   (get-value () (response uint uint))
;; ))

;; Public Functions
;; ===============================================

;; Create a new item
(define-public (create-item)
  (let ((id (+ (var-get counter) u1)))
    (map-set items id {owner: tx-sender, active: true})
    (var-set counter id)
    (ok id)
  )
)

;; Read-only Functions
;; ===============================================

;; Get an item by ID
(define-read-only (get-item (id uint))
  (map-get? items id)
)

;; Get the counter value
(define-read-only (get-count)
  (var-get counter)
)

;; Update Functions
;; ===============================================

;; Update an item (example)
(define-public (update-item (id uint))
  (let ((item (unwrap! (map-get? items id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner item)) err-unauthorized)
    (asserts! (get active item) err-invalid-state)
    (map-set items id (merge item {active: false}))
    (ok true)
  )
)