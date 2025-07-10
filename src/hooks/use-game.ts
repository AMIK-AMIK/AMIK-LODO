"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { GameState, Token, Player, GameConfig, TokenPosition, PlayerColor } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { getAiMove } from '@/app/actions'
import { updateLeaderboard } from '@/components/game/leaderboard-dialog'
import {
  getInitialTokens,
  isSafeZone,
  getAbsoluteTrackIndex,
  getRelativeSteps,
} from '@/lib/game-logic'

export function useGame(config: GameConfig | null) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const { toast } = useToast()

  const initializeGame = useCallback(() => {
    if (!config) return
    const initialTokens = getInitialTokens(config.players)
    setGameState({
      players: config.players,
      tokens: initialTokens,
      currentPlayerIndex: 0,
      diceValue: null,
      turnState: 'rolling',
      validMoves: [],
      winner: null,
      gameHistory: [],
      consecutiveSixes: 0,
    })
  }, [config])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const addHistory = (log: string) => {
    setGameState(prev => prev ? ({ ...prev, gameHistory: [log, ...prev.gameHistory].slice(0, 50) }) : null);
  }

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length
      return {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        turnState: 'rolling',
        diceValue: null,
        validMoves: [],
        consecutiveSixes: 0,
      }
    })
  }, [])

  const moveToken = useCallback((tokenId: number) => {
    setGameState(prev => {
      if (!prev || prev.turnState !== 'moving') return prev

      const move = prev.validMoves.find(m => m.tokenId === tokenId)
      if (!move) return prev

      let newTokens = [...prev.tokens]
      const currentTokenIndex = newTokens.findIndex(t => t.id === tokenId)
      const currentPlayer = prev.players[prev.currentPlayerIndex]

      // Capture logic
      if (move.newPosition.type === 'track' && !isSafeZone(move.newPosition.index)) {
        const opponentTokensOnSquare = newTokens.filter(t => 
            t.color !== currentPlayer.color &&
            t.position.type === 'track' && 
            t.position.index === move.newPosition.index
        );
        const ownTokensOnSquare = newTokens.filter(t => 
            t.color === currentPlayer.color &&
            t.position.type === 'track' && 
            t.position.index === move.newPosition.index
        );

        // Can only capture if it's a single opponent token
        if (opponentTokensOnSquare.length === 1 && ownTokensOnSquare.length === 0) {
            const capturedToken = opponentTokensOnSquare[0];
            const capturedTokenIndex = newTokens.findIndex(t => t.id === capturedToken.id);
            const capturedPlayer = prev.players.find(p => p.color === capturedToken.color)!;
            const baseTokensCount = newTokens.filter(t => t.color === capturedToken.color && t.position.type === 'base').length;
            
            newTokens[capturedTokenIndex].position = { type: 'base', index: baseTokensCount };
            addHistory(`⚔️ ${currentPlayer.name} captured ${capturedPlayer.name}'s token!`);
        }
      }

      newTokens[currentTokenIndex].position = move.newPosition
      addHistory(`➡️ ${currentPlayer.name} moved a token to ${move.newPosition.type} ${move.newPosition.index}.`);
      
      const gameJustWon = newTokens.filter(t => t.color === currentPlayer.color).every(t => t.position.type === 'finished');

      if (gameJustWon) {
        addHistory(`🎉 ${currentPlayer.name} has won the game!`);
        updateLeaderboard(currentPlayer.name);
        // We set winner in a separate effect to ensure state is updated first
        return { ...prev, tokens: newTokens, winner: currentPlayer };
      }

      // If a 6 was rolled, player gets another turn
      if (prev.diceValue === 6) {
        return {
          ...prev,
          tokens: newTokens,
          turnState: 'rolling',
          diceValue: null,
          validMoves: [],
          // consecutiveSixes is handled in rollDice
        }
      } else {
        // Otherwise, next player's turn after a short delay
        setTimeout(nextTurn, 100);
        return { ...prev, tokens: newTokens, turnState: 'ai-thinking' }; // Use ai-thinking to prevent clicks
      }
    })
  }, [nextTurn]);

  const calculateValidMoves = useCallback((player: Player, diceValue: number, tokens: Token[]) => {
    const playerTokens = tokens.filter(t => t.color === player.color);
    const validMoves: { tokenId: number; newPosition: TokenPosition }[] = [];

    const isBlockedByOpponent = (pos: TokenPosition, color: PlayerColor) => {
        if (pos.type !== 'track') return false;
        // A square is blocked if there are 2 or more opponent tokens on it
        const occupants = tokens.filter(t => 
            t.color !== color &&
            t.position.type === 'track' && 
            t.position.index === pos.index
        );
        return occupants.length >= 2;
    }

    for (const token of playerTokens) {
      if (token.position.type === 'base') {
        if (diceValue === 6) {
          const startPos = { type: 'track' as const, index: getAbsoluteTrackIndex(player.color, 0) };
          if (!isBlockedByOpponent(startPos, player.color)) {
            validMoves.push({ tokenId: token.id, newPosition: startPos });
          }
        }
      } else if (token.position.type === 'track') {
        const relativePos = getRelativeSteps(player.color, token.position.index);
        let newRelativePos = relativePos + diceValue;

        // Check path for blocks
        let pathIsClear = true;
        for (let i = 1; i <= diceValue; i++) {
            const stepPos = getAbsoluteTrackIndex(player.color, relativePos + i);
            if(isBlockedByOpponent({ type: 'track', index: stepPos }, player.color)) {
                pathIsClear = false;
                break;
            }
        }
        if (!pathIsClear) continue;


        if (newRelativePos < 51) {
          const newAbsPos = getAbsoluteTrackIndex(player.color, newRelativePos);
           validMoves.push({ tokenId: token.id, newPosition: { type: 'track', index: newAbsPos } });
        } else {
          const homeStretchIndex = newRelativePos - 51;
          if (homeStretchIndex < 6) {
            validMoves.push({ tokenId: token.id, newPosition: { type: 'home-stretch', index: homeStretchIndex } });
          } else if (homeStretchIndex === 6) {
            const finishedCount = playerTokens.filter(t => t.position.type === 'finished').length;
            if (finishedCount < 4) {
               validMoves.push({ tokenId: token.id, newPosition: { type: 'finished', index: finishedCount } });
            }
          }
        }
      } else if (token.position.type === 'home-stretch') {
        const newHomeIndex = token.position.index + diceValue;
        if (newHomeIndex < 6) {
          validMoves.push({ tokenId: token.id, newPosition: { type: 'home-stretch', index: newHomeIndex } });
        } else if (newHomeIndex === 6) {
           const finishedCount = playerTokens.filter(t => t.position.type === 'finished').length;
            if (finishedCount < 4) {
               validMoves.push({ tokenId: token.id, newPosition: { type: 'finished', index: finishedCount } });
            }
        }
      }
    }
    return validMoves;
  }, []);

  const rollDice = useCallback(() => {
    if (!gameState || gameState.turnState !== 'rolling' || gameState.winner) return;

    const diceValue = Math.floor(Math.random() * 6) + 1;
    // const diceValue = 6; // For testing
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const newConsecutiveSixes = diceValue === 6 ? gameState.consecutiveSixes + 1 : 0;
    
    addHistory(`🎲 ${currentPlayer.name} rolled a ${diceValue}.`);

    if (newConsecutiveSixes === 3) {
        addHistory(`🎲 Oops! ${currentPlayer.name} rolled three 6s in a row. Turn forfeited.`);
        toast({ title: "Three 6s!", description: "Turn forfeited. Better luck next time!" });
        setTimeout(nextTurn, 1500);
        return;
    }
    
    const validMoves = calculateValidMoves(currentPlayer, diceValue, gameState.tokens);

    setGameState(prev => prev ? ({ 
        ...prev, 
        diceValue, 
        validMoves, 
        consecutiveSixes: newConsecutiveSixes,
        turnState: validMoves.length > 0 ? 'moving' : (diceValue === 6 ? 'rolling' : 'rolling'),
    }) : null);

    if (validMoves.length === 0) {
      toast({ title: "No valid moves!", description: `${currentPlayer.name} can't move.` });
      // If no moves but rolled a 6, they roll again. Otherwise, next turn.
      if (diceValue !== 6) {
        setTimeout(nextTurn, 1500);
      }
    }
  }, [gameState, calculateValidMoves, nextTurn, toast]);

  const restartGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  const isMyTurn = useMemo(() => {
    if (!gameState || gameState.winner) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer.type === 'human';
  }, [gameState]);
  
  // AI Turn Logic
  useEffect(() => {
    if (!gameState || gameState.winner || !isMyTurn) return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type === 'human' && gameState.turnState === 'moving' && gameState.validMoves.length === 0) {
        if(gameState.diceValue !== 6) {
            setTimeout(nextTurn, 1000);
        } else {
            setGameState(prev => prev ? ({...prev, turnState: 'rolling'}) : null);
        }
    }
  }, [gameState, isMyTurn, nextTurn]);
  
  // AI Turn Logic
  useEffect(() => {
    if (!gameState || gameState.winner || isMyTurn) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type === 'ai' && gameState.turnState === 'rolling') {
      setGameState(prev => prev ? ({ ...prev, turnState: 'ai-thinking' }) : null);
      
      const performAiTurn = async () => {
        await new Promise(res => setTimeout(res, 800)); // AI "thinking" delay
        
        const diceValue = Math.floor(Math.random() * 6) + 1;
        const newConsecutiveSixes = diceValue === 6 ? (gameState.consecutiveSixes || 0) + 1 : 0;
        addHistory(`🎲 (AI) ${currentPlayer.name} rolled a ${diceValue}.`);
        
        if (newConsecutiveSixes === 3) {
            addHistory(`🎲 Oops! (AI) ${currentPlayer.name} rolled three 6s in a row. Turn forfeited.`);
            setTimeout(nextTurn, 1000);
            return;
        }

        const validMoves = calculateValidMoves(currentPlayer, diceValue, gameState.tokens);

        setGameState(prev => prev ? ({ ...prev, diceValue, validMoves, consecutiveSixes: newConsecutiveSixes }) : null);

        if (validMoves.length === 0) {
          if (diceValue === 6) {
            // Roll again if it's a 6 and no moves
            setGameState(prev => prev ? ({ ...prev, turnState: 'rolling' }) : null);
          } else {
            setTimeout(nextTurn, 1000);
          }
          return;
        }

        await new Promise(res => setTimeout(res, 500));
        setGameState(prev => prev ? ({...prev, turnState: 'moving'}) : null);

        const boardStateForAi = { red: [], green: [], yellow: [], blue: [] } as Record<PlayerColor, string[]>;
        gameState.tokens.forEach(token => {
            boardStateForAi[token.color].push(`${token.position.type} ${token.position.index}`);
        });

        const bestMove = await getAiMove(boardStateForAi, validMoves, currentPlayer.name, diceValue);
        
        await new Promise(res => setTimeout(res, 500));
        
        if (bestMove) {
          moveToken(bestMove.tokenId);
        } else {
            // This case should ideally not be hit if validMoves.length > 0
            if (diceValue !== 6) {
                setTimeout(nextTurn, 1000);
            } else {
                setGameState(prev => prev ? ({ ...prev, turnState: 'rolling' }) : null);
            }
        }
      };
      
      performAiTurn();
    }
  }, [gameState, calculateValidMoves, moveToken, nextTurn, toast, isMyTurn]);

  return { gameState, rollDice, moveToken, restartGame, isMyTurn };
}
