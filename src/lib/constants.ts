import type { PlayerColor, TokenPosition } from './types'

type Coordinates = { x: number; y: number };
type TokenCoordinates = Record<PlayerColor, Record<TokenPosition['type'], Coordinates[]>>;

const TILE = 32;
const HALF = TILE / 2;
const GRID_OFFSET = TILE / 2; // To center the grid in the 480x480 box

const path: Coordinates[] = [
  // Red path entrance area (bottom-left)
  { x: 1 * TILE, y: 6 * TILE }, { x: 2 * TILE, y: 6 * TILE }, { x: 3 * TILE, y: 6 * TILE }, { x: 4 * TILE, y: 6 * TILE }, { x: 5 * TILE, y: 6 * TILE },
  // Up to top-left corner
  { x: 6 * TILE, y: 5 * TILE }, { x: 6 * TILE, y: 4 * TILE }, { x: 6 * TILE, y: 3 * TILE }, { x: 6 * TILE, y: 2 * TILE }, { x: 6 * TILE, y: 1 * TILE }, { x: 6 * TILE, y: 0 * TILE },
  // Across to top-right corner
  { x: 7 * TILE, y: 0 * TILE }, { x: 8 * TILE, y: 0 * TILE },
  { x: 8 * TILE, y: 1 * TILE }, { x: 8 * TILE, y: 2 * TILE }, { x: 8 * TILE, y: 3 * TILE }, { x: 8 * TILE, y: 4 * TILE }, { x: 8 * TILE, y: 5 * TILE },
  // Down to bottom-right corner
  { x: 9 * TILE, y: 6 * TILE }, { x: 10 * TILE, y: 6 * TILE }, { x: 11 * TILE, y: 6 * TILE }, { x: 12 * TILE, y: 6 * TILE }, { x: 13 * TILE, y: 6 * TILE }, { x: 14 * TILE, y: 6 * TILE },
  // Across to bottom-right
  { x: 14 * TILE, y: 7 * TILE }, { x: 14 * TILE, y: 8 * TILE },
  { x: 13 * TILE, y: 8 * TILE }, { x: 12 * TILE, y: 8 * TILE }, { x: 11 * TILE, y: 8 * TILE }, { x: 10 * TILE, y: 8 * TILE }, { x: 9 * TILE, y: 8 * TILE },
  // Up to top-right
  { x: 8 * TILE, y: 9 * TILE }, { x: 8 * TILE, y: 10 * TILE }, { x: 8 * TILE, y: 11 * TILE }, { x: 8 * TILE, y: 12 * TILE }, { x: 8 * TILE, y: 13 * TILE }, { x: 8 * TILE, y: 14 * TILE },
  // Across to top-left
  { x: 7 * TILE, y: 14 * TILE }, { x: 6 * TILE, y: 14 * TILE },
  { x: 6 * TILE, y: 13 * TILE }, { x: 6 * TILE, y: 12 * TILE }, { x: 6 * TILE, y: 11 * TILE }, { x: 6 * TILE, y: 10 * TILE }, { x: 6 * TILE, y: 9 * TILE },
  // Down to bottom-left
  { x: 5 * TILE, y: 8 * TILE }, { x: 4 * TILE, y: 8 * TILE }, { x: 3 * TILE, y: 8 * TILE }, { x: 2 * TILE, y: 8 * TILE }, { x: 1 * TILE, y: 8 * TILE }, { x: 0 * TILE, y: 8 * TILE },
  { x: 0 * TILE, y: 7 * TILE }, { x: 0 * TILE, y: 6 * TILE },
].map(p => ({ x: p.x + HALF, y: p.y + HALF }));


const homeStretch: Record<PlayerColor, Coordinates[]> = {
  red: Array.from({ length: 6 }, (_, i) => ({ x: (i + 1) * TILE, y: 7 * TILE })).map(p => ({ x: p.x + HALF, y: p.y + HALF })),
  green: Array.from({ length: 6 }, (_, i) => ({ x: 7 * TILE, y: (i + 1) * TILE })).map(p => ({ x: p.x + HALF, y: p.y + HALF })),
  yellow: Array.from({ length: 6 }, (_, i) => ({ x: (13 - i) * TILE, y: 7 * TILE })).map(p => ({ x: p.x + HALF, y: p.y + HALF })),
  blue: Array.from({ length: 6 }, (_, i) => ({ x: 7 * TILE, y: (13 - i) * TILE })).map(p => ({ x: p.x + HALF, y: p.y + HALF })),
};

const base: Record<PlayerColor, Coordinates[]> = {
    red:    [{ x: 96-24, y: 96-24 }, { x: 96+24, y: 96-24 }, { x: 96+24, y: 96+24 }, { x: 96-24, y: 96+24 }],
    green:  [{ x: 384-24, y: 96-24 }, { x: 384+24, y: 96-24 }, { x: 384+24, y: 96+24 }, { x: 384-24, y: 96+24 }],
    blue:   [{ x: 96-24, y: 384-24 }, { x: 96+24, y: 384-24 }, { x: 96+24, y: 384+24 }, { x: 96-24, y: 384+24 }],
    yellow: [{ x: 384-24, y: 384-24 }, { x: 384+24, y: 384-24 }, { x: 384+24, y: 384+24 }, { x: 384-24, y: 384+24 }],
};

const finished: Record<PlayerColor, Coordinates[]> = {
    red:    Array.from({length: 4}, (_, i) => ({ x: 240 + (i-1.5)*20, y: 240 - 20 })),
    green:  Array.from({length: 4}, (_, i) => ({ x: 240 + 20, y: 240 + (i-1.5)*20 })),
    yellow: Array.from({length: 4}, (_, i) => ({ x: 240 + (i-1.5)*20, y: 240 + 20 })),
    blue:   Array.from({length: 4}, (_, i) => ({ x: 240 - 20, y: 240 + (i-1.5)*20 })),
}

const colorOffsets = { red: 0, green: 13, yellow: 26, blue: 39 };

export const BOARD_COORDS = {
    path,
    homeStretch,
    start: {
        red: path[colorOffsets.red],
        green: path[colorOffsets.green],
        yellow: path[colorOffsets.yellow],
        blue: path[colorOffsets.blue],
    },
    safeIndices: [8, 21, 34, 47, colorOffsets.red, colorOffsets.green, colorOffsets.yellow, colorOffsets.blue],
    safe: [path[8], path[21], path[34], path[47], path[colorOffsets.red], path[colorOffsets.green], path[colorOffsets.yellow], path[colorOffsets.blue]],
    tokens: {
        red: { base: base.red, track: path, finished: finished.red, 'home-stretch': homeStretch.red },
        green: { base: base.green, track: path, finished: finished.green, 'home-stretch': homeStretch.green },
        yellow: { base: base.yellow, track: path, finished: finished.yellow, 'home-stretch': homeStretch.yellow },
        blue: { base: base.blue, track: path, finished: finished.blue, 'home-stretch': homeStretch.blue },
    },
    colorOffsets,
}
