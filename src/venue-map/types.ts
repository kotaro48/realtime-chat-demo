// Axis-aligned bounding rectangle (world coordinates)
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

// Member info attached to a booth
export interface BoothMember {
  id: string
  name: string         // Japanese: "柏木 由紀"
  romaji: string       // Badge format: "YUKI.K"
  team: string         // "Team B"
  gradientFrom: string // CSS color
  gradientTo: string
  laneNum: number      // official lane number for the event
}

// A single handshake lane/booth in the venue
export interface Booth {
  id: string
  label: string        // display label, e.g. "A-1"
  rect: Rect           // collision/render rect in world px
  triggerZone: Rect    // slightly larger area; entering triggers interaction
  member: BoothMember
}

// Full venue definition
export interface VenueMap {
  width: number
  height: number
  booths: Booth[]
  spawnPoint: { x: number; y: number }
}

// Player runtime state (not stored in React state — managed via refs)
export interface PlayerState {
  x: number
  y: number
}
