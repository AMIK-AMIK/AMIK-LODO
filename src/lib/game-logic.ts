import type { Player, Token, PlayerColor, TokenPosition } from './types'
import { BOARD_COORDS } from './constants'

export const getInitialTokens = (players: Player[]): Token[] => {
  const tokens: Token[] = []
  let globalId = 0;
  players.forEach(player => {
    for (let i = 0; i < 4; i++) {
      tokens.push({
        id: globalId++,
        color: player.color,
        position: { type: 'base', index: i },
      })
    }
  })
  return tokens
}

export const getAbsoluteTrackIndex = (color: PlayerColor, stepsFromStart: number): number => {
    const offset = BOARD_COORDS.colorOffsets[color];
    return (offset + stepsFromStart) % 52;
}

export const getRelativeSteps = (color: PlayerColor, absoluteIndex: number): number => {
    const offset = BOARD_COORDS.colorOffsets[color];
    return (absoluteIndex - offset + 52) % 52;
}

export const isSafeZone = (trackIndex: number): boolean => {
    return BOARD_COORDS.safeIndices.includes(trackIndex);
}
