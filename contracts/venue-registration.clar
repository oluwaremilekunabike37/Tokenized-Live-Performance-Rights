;; Venue Registration Contract
;; Records details of performance locations

(define-data-var admin principal tx-sender)

;; Data map to store registered venues
(define-map venues principal
  {
    name: (string-utf8 100),
    location: (string-utf8 100),
    capacity: uint,
    verified: bool,
    registration-date: uint
  }
)

;; Public function to register a venue
(define-public (register-venue (name (string-utf8 100)) (location (string-utf8 100)) (capacity uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))
    (ok (map-set venues tx-sender
      {
        name: name,
        location: location,
        capacity: capacity,
        verified: true,
        registration-date: block-height
      }
    ))
  )
)

;; Read-only function to check if a venue is verified
(define-read-only (is-verified-venue (venue-address principal))
  (default-to false (get verified (map-get? venues venue-address)))
)

;; Read-only function to get venue details
(define-read-only (get-venue-details (venue-address principal))
  (map-get? venues venue-address)
)

;; Function to transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u2))
    (ok (var-set admin new-admin))
  )
)

