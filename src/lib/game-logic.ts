import type { Player, Token, PlayerColor, TokenPosition } from './types'
import { BOARD_COORDS } from './constants'

export const getInitialTokens = (players: Player[]): Token[] => {
  const tokens: Token[] = []
  let tokenId = 0
  players.forEach(player => {
    for (let i = 0; i < 4; i++) {
      tokens.push({
        id: tokenId++,
        color: player.color,
        position: { type: 'base', index: i },
      })
    }
  })
  return tokens
}

export const getTrackPath = (color: PlayerColor, index: number): TokenPosition | null => {
  const offset = BOARD_COORDS.colorOffsets[color];
  const totalPathLength = BOARD_COORDS.path.length; // 52
  const entryPoint = (offset + totalPathLength -1) % totalPathLength;
  
  if (index > entryPoint) {
    return null; // Will enter home stretch
  }
  return { type: 'track', index };
}

export const getHomeStretchPath = (color: PlayerColor, index: number): TokenPosition | null => {
  if (index < 6) {
    return { type: 'home-stretch', index };
  }
  if (index === 6) {
    return { type: 'finished', index: 0 }; // A bit simplified, needs to handle multiple finished tokens
  }
  return null;
};

export const isSafeZone = (trackIndex: number): boolean => {
    return BOARD_COORDS.safe.some(safePos => {
        const pathIndex = BOARD_COORDS.path.findIndex(p => p.x === safePos.x && p.y === safePos.y);
        return pathIndex === trackIndex;
    });
}
