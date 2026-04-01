import { Booth, VenueMap } from './types'

// ── Layout constants (world pixels) ─────────────────────────────────────

export const MAP_W = 720
export const MAP_H = 560
export const PLAYER_SIZE = 20

const BOOTH_W = 120
const BOOTH_H = 72
const TRIGGER_PAD = 24   // extra px around booth that triggers interaction

// Booth column x positions (3 columns, spaced evenly)
const COL_X = [60, 300, 540]

// Booth row y positions (3 rows from top)
const ROW_Y = [50, 210, 370]

// ── Build booth helper ────────────────────────────────────────────────────

function makeBooth(
  id: string,
  label: string,
  col: number,
  row: number,
  member: Booth['member'],
): Booth {
  const x = COL_X[col]
  const y = ROW_Y[row]
  return {
    id,
    label,
    rect: { x, y, w: BOOTH_W, h: BOOTH_H },
    triggerZone: {
      x: x - TRIGGER_PAD,
      y: y - TRIGGER_PAD,
      w: BOOTH_W + TRIGGER_PAD * 2,
      h: BOOTH_H + TRIGGER_PAD * 2,
    },
    member,
  }
}

// ── Venue definition: AKB48 握手会 (幕張メッセ仮想会場) ──────────────────

const booths: Booth[] = [
  // ── Row A (top) ──────────────────────────────────────────────────
  makeBooth('a1', 'A-1', 0, 0, {
    id: 'kashiwagi',
    name: '柏木 由紀',
    romaji: 'YUKI.K',
    team: 'Team B',
    gradientFrom: '#FDA4AF',
    gradientTo: '#9D174D',
    laneNum: 1,
  }),
  makeBooth('a2', 'A-2', 1, 0, {
    id: 'yokoyama',
    name: '横山 由依',
    romaji: 'YUI.Y',
    team: 'Team K',
    gradientFrom: '#BAE6FD',
    gradientTo: '#0369A1',
    laneNum: 2,
  }),
  makeBooth('a3', 'A-3', 2, 0, {
    id: 'mukaichi',
    name: '向井地 美音',
    romaji: 'MION.M',
    team: 'Team A',
    gradientFrom: '#DDD6FE',
    gradientTo: '#6D28D9',
    laneNum: 3,
  }),

  // ── Row B (middle) ────────────────────────────────────────────────
  makeBooth('b1', 'B-1', 0, 1, {
    id: 'okada',
    name: '岡田 奈々',
    romaji: 'NANA.O',
    team: 'Team 4',
    gradientFrom: '#6EE7B7',
    gradientTo: '#065F46',
    laneNum: 4,
  }),
  makeBooth('b2', 'B-2', 1, 1, {
    id: 'oguri',
    name: '小栗 有以',
    romaji: 'YUI.O',
    team: 'Team 8',
    gradientFrom: '#FDE68A',
    gradientTo: '#B45309',
    laneNum: 5,
  }),
  makeBooth('b3', 'B-3', 2, 1, {
    id: 'komiyama',
    name: '込山 榛香',
    romaji: 'HARUKA.K',
    team: 'Team K',
    gradientFrom: '#99F6E4',
    gradientTo: '#0F766E',
    laneNum: 6,
  }),

  // ── Row C (bottom) ────────────────────────────────────────────────
  makeBooth('c1', 'C-1', 0, 2, {
    id: 'murayama',
    name: '村山 彩希',
    romaji: 'YUIRI.M',
    team: 'Team 4',
    gradientFrom: '#C7D2FE',
    gradientTo: '#3730A3',
    laneNum: 7,
  }),
  makeBooth('c2', 'C-2', 1, 2, {
    id: 'honda',
    name: '本田 仁美',
    romaji: 'HITOMI.H',
    team: 'Team B',
    gradientFrom: '#FBCFE8',
    gradientTo: '#9D174D',
    laneNum: 8,
  }),
  makeBooth('c3', 'C-3', 2, 2, {
    id: 'kubo',
    name: '久保 怜音',
    romaji: 'REON.K',
    team: 'Team B',
    gradientFrom: '#FED7AA',
    gradientTo: '#9A3412',
    laneNum: 9,
  }),
]

export const AKB48_VENUE: VenueMap = {
  width: MAP_W,
  height: MAP_H,
  booths,
  spawnPoint: { x: MAP_W / 2, y: MAP_H - 50 },
}
