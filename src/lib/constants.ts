import type { PlayerColor, TokenPosition } from './types'

type Coordinates = { x: number; y: number };
type TokenCoordinates = Record<PlayerColor, Record<TokenPosition['type'], Coordinates[]>>;

const TILE = 32;
const HALF = TILE / 2;

const path: Coordinates[] = [
  // Red path
  { x: 1 * TILE + HALF, y: 6 * TILE + HALF }, { x: 2 * TILE + HALF, y: 6 * TILE + HALF }, { x: 3 * TILE + HALF, y: 6 * TILE + HALF }, { x: 4 * TILE + HALF, y: 6 * TILE + HALF }, { x: 5 * TILE + HALF, y: 6 * TILE + HALF },
  { x: 6 * TILE + HALF, y: 5 * TILE + HALF }, { x: 6 * TILE + HALF, y: 4 * TILE + HALF }, { x: 6 * TILE + HALF, y: 3 * TILE + HALF }, { x: 6 * TILE + HALF, y: 2 * TILE + HALF }, { x: 6 * TILE + HALF, y: 1 * TILE + HALF },
  { x: 7 * TILE + HALF, y: 1 * TILE + HALF }, { x: 8 * TILE + HALF, y: 1 * TILE + HALF },
  // Green path
  { x: 8 * TILE + HALF, y: 2 * TILE + HALF }, { x: 8 * TILE + HALF, y: 3 * TILE + HALF }, { x: 8 * TILE + HALF, y: 4 * TILE + HALF }, { x: 8 * TILE + HALF, y: 5 * TILE + HALF }, { x: 8 * TILE + HALF, y: 6 * TILE + HALF },
  { x: 9 * TILE + HALF, y: 6 * TILE + HALF }, { x: 10 * TILE + HALF, y: 6 * TILE + HALF }, { x: 11 * TILE + HALF, y: 6 * TILE + HALF }, { x: 12 * TILE + HALF, y: 6 * TILE + HALF }, { x: 13 * TILE + HALF, y: 6 * TILE + HALF },
  { x: 13 * TILE + HALF, y: 7 * TILE + HALF }, { x: 13 * TILE + HALF, y: 8 * TILE + HALF },
  // Yellow path
  { x: 12 * TILE + HALF, y: 8 * TILE + HALF }, { x: 11 * TILE + HALF, y: 8 * TILE + HALF }, { x: 10 * TILE + HALF, y: 8 * TILE + HALF }, { x: 9 * TILE + HALF, y: 8 * TILE + HALF }, { x: 8 * TILE + HALF, y: 8 * TILE + HALF },
  { x: 8 * TILE + HALF, y: 9 * TILE + HALF }, { x: 8 * TILE + HALF, y: 10 * TILE + HALF }, { x: 8 * TILE + HALF, y: 11 * TILE + HALF }, { x: 8 * TILE + HALF, y: 12 * TILE + HALF }, { x: 8 * TILE + HALF, y: 13 * TILE + HALF },
  { x: 7 * TILE + HALF, y: 13 * TILE + HALF }, { x: 6 * TILE + HALF, y: 13 * TILE + HALF },
  // Blue path
  { x: 6 * TILE + HALF, y: 12 * TILE + HALF }, { x: 6 * TILE + HALF, y: 11 * TILE + HALF }, { x: 6 * TILE + HALF, y: 10 * TILE + HALF }, { x: 6 * TILE + HALF, y: 9 * TILE + HALF }, { x: 6 * TILE + HALF, y: 8 * TILE + HALF },
  { x: 5 * TILE + HALF, y: 8 * TILE + HALF }, { x: 4 * TILE + HALF, y: 8 * TILE + HALF }, { x: 3 * TILE + HALF, y: 8 * TILE + HALF }, { x: 2 * TILE + HALF, y: 8 * TILE + HALF }, { x: 1 * TILE + HALF, y: 8 * TILE + HALF },
  { x: 1 * TILE + HALF, y: 7 * TILE + HALF }, { x: 1 * TILE + HALF, y: 6 * TILE + HALF },
].map(p => ({ x: p.x + TILE, y: p.y + TILE }));


const homeStretch: Record<PlayerColor, Coordinates[]> = {
  red: Array.from({ length: 6 }, (_, i) => ({ x: (i + 2) * TILE + HALF, y: 7 * TILE + HALF })),
  green: Array.from({ length: 6 }, (_, i) => ({ x: 7 * TILE + HALF, y: (i + 2) * TILE + HALF })),
  yellow: Array.from({ length: 6 }, (_, i) => ({ x: (12 - i) * TILE + HALF, y: 7 * TILE + HALF })),
  blue: Array.from({ length: 6 }, (_, i) => ({ x: 7 * TILE + HALF, y: (12 - i) * TILE + HALF })),
};

const base: Record<PlayerColor, Coordinates[]> = {
    red: [{ x: 96, y: 96-24 }, { x: 96+24, y: 96 }, { x: 96, y: 96+24 }, { x: 96-24, y: 96 }].map(p => ({ x: p.x - 24, y: p.y - 24 })),
    green: [{ x: 384, y: 96-24 }, { x: 384+24, y: 96 }, { x: 384, y: 96+24 }, { x: 384-24, y: 96 }].map(p => ({ x: p.x - 24, y: p.y - 24 })),
    blue: [{ x: 96, y: 384-24 }, { x: 96+24, y: 384 }, { x: 96, y: 384+24 }, { x: 96-24, y: 384 }].map(p => ({ x: p.x - 24, y: p.y - 24 })),
    yellow: [{ x: 384, y: 384-24 }, { x: 384+24, y: 384 }, { x: 384, y: 384+24 }, { x: 384-24, y: 384 }].map(p => ({ x: p.x - 24, y: p.y - 24 })),
};

const finished: Record<PlayerColor, Coordinates[]> = {
    red: Array.from({length: 4}, (_, i) => ({ x: homeStretch.red[5].x + 10*(i-1.5), y: homeStretch.red[5].y })),
    green: Array.from({length: 4}, (_, i) => ({ x: homeStretch.green[5].x, y: homeStretch.green[5].y + 10*(i-1.5) })),
    yellow: Array.from({length: 4}, (_, i) => ({ x: homeStretch.yellow[5].x + 10*(i-1.5), y: homeStretch.yellow[5].y })),
    blue: Array.from({length: 4}, (_, i) => ({ x: homeStretch.blue[5].x, y: homeStretch.blue[5].y + 10*(i-1.5) })),
}

const colorOffsets = { red: 0, green: 13, yellow: 26, blue: 39 };

export const BOARD_COORDS = {
    path,
    homeStretch: {
        red: homeStretch.red.map(p => ({ x: p.x + TILE, y: p.y + TILE })),
        green: homeStretch.green.map(p => ({ x: p.x + TILE, y: p.y + TILE })),
        yellow: homeStretch.yellow.map(p => ({ x: p.x + TILE, y: p.y + TILE })),
        blue: homeStretch.blue.map(p => ({ x: p.x + TILE, y: p.y + TILE })),
    },
    start: {
        red: path[colorOffsets.red],
        green: path[colorOffsets.green],
        yellow: path[colorOffsets.yellow],
        blue: path[colorOffsets.blue],
    },
    safe: [ path[8], path[21], path[34], path[47], path[colorOffsets.red], path[colorOffsets.green], path[colorOffsets.yellow], path[colorOffsets.blue] ],
    tokens: {
        red: { base: base.red, track: path, home: [], finished: finished.red, 'home-stretch': homeStretch.red.map(p => ({ x: p.x + TILE, y: p.y + TILE })) },
        green: { base: base.green, track: path, home: [], finished: finished.green, 'home-stretch': homeStretch.green.map(p => ({ x: p.x + TILE, y: p.y + TILE })) },
        yellow: { base: base.yellow, track: path, home: [], finished: finished.yellow, 'home-stretch': homeStretch.yellow.map(p => ({ x: p.x + TILE, y: p.y + TILE })) },
        blue: { base: base.blue, track: path, home: [], finished: finished.blue, 'home-stretch': homeStretch.blue.map(p => ({ x: p.x + TILE, y: p.y + TILE })) },
    },
    colorOffsets,
}
