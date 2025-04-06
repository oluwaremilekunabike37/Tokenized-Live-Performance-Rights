;; Performer Verification Contract
;; This contract validates legitimate artists and musicians

(define-data-var admin principal tx-sender)

;; Data map to store verified performers
(define-map performers principal
  {
    name: (string-utf8 100),
    verified: bool,
    genre: (string-utf8 50),
    registration-date: uint
  }
)

;; Public function to register a performer (only admin can verify)
(define-public (register-performer (name (string-utf8 100)) (genre (string-utf8 50)))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))
    (ok (map-set performers tx-sender
      {
        name: name,
        verified: true,
        genre: genre,
        registration-date: block-height
      }
    ))
  )
)

;; Read-only function to check if a performer is verified
(define-read-only (is-verified-performer (performer-address principal))
  (default-to false (get verified (map-get? performers performer-address)))
)

;; Read-only function to get performer details
(define-read-only (get-performer-details (performer-address principal))
  (map-get? performers performer-address)
)

;; Function to transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u2))
    (ok (var-set admin new-admin))
  )
)

