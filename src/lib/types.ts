export type PlayerType = 'human' | 'ai';
export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Player {
  id: number;
  type: PlayerType;
  color: PlayerColor;
  name: string;
  uid?: string; // Firebase Auth User ID for human players
}

export type TokenPosition = {
  type: 'base' | 'track' | 'home-stretch' | 'finished';
  index: number;
};

export interface Token {
  id: number;
  color: PlayerColor;
  position: TokenPosition;
}

export type GameState = {
  players: Player[];
  tokens: Token[];
  currentPlayerIndex: number;
  diceValue: number | null;
  turnState: 'rolling' | 'moving' | 'ai-thinking';
  validMoves: { tokenId: number; newPosition: TokenPosition }[];
  winner: Player | null;
  gameHistory: string[];
  consecutiveSixes: number;
};

export interface GameConfig {
  players: Player[];
  creatorUid?: string;
  createdAt?: Date;
}
