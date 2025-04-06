import { describe, it, expect, beforeEach } from "vitest"

// Mock Clarity environment
const mockClarity = {
  tx: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  },
  block: {
    height: 100,
  },
  contracts: {
    venueRegistration: {
      functions: {
        registerVenue: (name, location, capacity) => {
          if (mockClarity.tx.sender !== mockClarity.admin) {
            return { error: 1 }
          }
          mockClarity.venues[mockClarity.tx.sender] = {
            name,
            location,
            capacity,
            verified: true,
            registrationDate: mockClarity.block.height,
          }
          return { value: true }
        },
        isVerifiedVenue: (address) => {
          return { value: mockClarity.venues[address]?.verified || false }
        },
        getVenueDetails: (address) => {
          return { value: mockClarity.venues[address] || null }
        },
        transferAdmin: (newAdmin) => {
          if (mockClarity.tx.sender !== mockClarity.admin) {
            return { error: 2 }
          }
          mockClarity.admin = newAdmin
          return { value: true }
        },
      },
    },
  },
  admin: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  venues: {},
}

describe("Venue Registration Contract", () => {
  beforeEach(() => {
    // Reset state
    mockClarity.venues = {}
    mockClarity.admin = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    mockClarity.tx.sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  })
  
  it("should register a venue when called by admin", () => {
    const result = mockClarity.contracts.venueRegistration.functions.registerVenue("Test Venue", "New York, USA", 500)
    expect(result.value).toBe(true)
    
    const venue = mockClarity.venues[mockClarity.tx.sender]
    expect(venue).toBeDefined()
    expect(venue.name).toBe("Test Venue")
    expect(venue.location).toBe("New York, USA")
    expect(venue.capacity).toBe(500)
    expect(venue.verified).toBe(true)
    expect(venue.registrationDate).toBe(100)
  })
  
  it("should not register a venue when called by non-admin", () => {
    mockClarity.tx.sender = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = mockClarity.contracts.venueRegistration.functions.registerVenue("Test Venue", "New York, USA", 500)
    expect(result.error).toBe(1)
  })
  
  it("should correctly check if a venue is verified", () => {
    // Register a venue
    mockClarity.contracts.venueRegistration.functions.registerVenue("Test Venue", "New York, USA", 500)
    
    // Check verification status
    let result = mockClarity.contracts.venueRegistration.functions.isVerifiedVenue(mockClarity.tx.sender)
    expect(result.value).toBe(true)
    
    // Check unregistered venue
    result = mockClarity.contracts.venueRegistration.functions.isVerifiedVenue(
        "ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    )
    expect(result.value).toBe(false)
  })
  
  it("should get venue details", () => {
    // Register a venue
    mockClarity.contracts.venueRegistration.functions.registerVenue("Test Venue", "New York, USA", 500)
    
    // Get details
    const result = mockClarity.contracts.venueRegistration.functions.getVenueDetails(mockClarity.tx.sender)
    expect(result.value).toEqual({
      name: "Test Venue",
      location: "New York, USA",
      capacity: 500,
      verified: true,
      registrationDate: 100,
    })
  })
  
  it("should transfer admin rights", () => {
    const newAdmin = "ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = mockClarity.contracts.venueRegistration.functions.transferAdmin(newAdmin)
    expect(result.value).toBe(true)
    expect(mockClarity.admin).toBe(newAdmin)
  })
  
  it("should not transfer admin rights when called by non-admin", () => {
    mockClarity.tx.sender = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const newAdmin = "ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const result = mockClarity.contracts.venueRegistration.functions.transferAdmin(newAdmin)
    expect(result.error).toBe(2)
    expect(mockClarity.admin).toBe("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")
  })
})

