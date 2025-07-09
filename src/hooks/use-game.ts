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
    })
  }, [config])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const addHistory = (log: string) => {
    setGameState(prev => prev ? ({ ...prev, gameHistory: [log, ...prev.gameHistory] }) : null);
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
      }
    })
  }, [])
  
  const checkForWinner = useCallback((tokens: Token[], player: Player) => {
    const playerTokens = tokens.filter(t => t.color === player.color);
    const allHome = playerTokens.every(t => t.position.type === 'finished');
    if (allHome) {
      setGameState(prev => prev ? ({ ...prev, winner: player }) : null);
      addHistory(`🎉 ${player.name} has won the game!`);
      updateLeaderboard(player.name);
    }
  }, []);

  const moveToken = useCallback((tokenId: number) => {
    setGameState(prev => {
      if (!prev || prev.turnState !== 'moving') return prev

      const move = prev.validMoves.find(m => m.tokenId === tokenId)
      if (!move) return prev

      let newTokens = [...prev.tokens]
      const currentTokenIndex = newTokens.findIndex(t => t.id === tokenId)
      const currentToken = newTokens[currentTokenIndex]
      const currentPlayer = prev.players[prev.currentPlayerIndex]

      // Capture logic
      if (move.newPosition.type === 'track' && !isSafeZone(move.newPosition.index)) {
        const opponentTokensOnSquare = newTokens.filter(t => 
            t.color !== currentToken.color &&
            t.position.type === 'track' && 
            t.position.index === move.newPosition.index
        );

        if (opponentTokensOnSquare.length === 1) {
            const capturedToken = opponentTokensOnSquare[0];
            const capturedTokenIndex = newTokens.findIndex(t => t.id === capturedToken.id);
            const capturedPlayer = prev.players.find(p => p.color === capturedToken.color)!;
            const baseTokensCount = newTokens.filter(t => t.color === capturedToken.color && t.position.type === 'base').length;
            
            newTokens[capturedTokenIndex].position = { type: 'base', index: baseTokensCount };
            addHistory(`⚔️ ${currentPlayer.name} captured ${capturedPlayer.name}'s token!`);
        }
      }

      newTokens[currentTokenIndex].position = move.newPosition
      addHistory(`➡️ ${currentPlayer.name} moved a token.`);
      
      const gameJustWon = newTokens.filter(t => t.color === currentPlayer.color).every(t => t.position.type === 'finished');

      if (gameJustWon) {
        setGameState(prev => prev ? ({ ...prev, tokens: newTokens, winner: currentPlayer }) : null);
        addHistory(`🎉 ${currentPlayer.name} has won the game!`);
        updateLeaderboard(currentPlayer.name);
        return prev; // Stop further state changes
      }

      if (prev.diceValue === 6) {
        return {
          ...prev,
          tokens: newTokens,
          turnState: 'rolling',
          diceValue: null,
          validMoves: [],
        }
      } else {
        setTimeout(nextTurn, 100);
        return { ...prev, tokens: newTokens, turnState: 'ai-thinking' }; // Use ai-thinking to prevent clicks
      }
    })
  }, [nextTurn]);

  const calculateValidMoves = useCallback((player: Player, diceValue: number, tokens: Token[]) => {
    const playerTokens = tokens.filter(t => t.color === player.color);
    const validMoves: { tokenId: number; newPosition: TokenPosition }[] = [];

    const isBlocked = (pos: TokenPosition) => {
        if (pos.type !== 'track' || isSafeZone(pos.index)) return false;
        const occupants = tokens.filter(t => t.position.type === pos.type && t.position.index === pos.index && t.color !== player.color);
        return occupants.length >= 2;
    }

    for (const token of playerTokens) {
      if (token.position.type === 'base') {
        if (diceValue === 6) {
          const startPos = { type: 'track' as const, index: getAbsoluteTrackIndex(player.color, 0) };
          if (!isBlocked(startPos)) {
            validMoves.push({ tokenId: token.id, newPosition: startPos });
          }
        }
      } else if (token.position.type === 'track') {
        const relativePos = getRelativeSteps(player.color, token.position.index);
        const newRelativePos = relativePos + diceValue;

        if (newRelativePos < 51) {
          const newAbsPos = getAbsoluteTrackIndex(player.color, newRelativePos);
          if (!isBlocked({ type: 'track', index: newAbsPos })) {
            validMoves.push({ tokenId: token.id, newPosition: { type: 'track', index: newAbsPos } });
          }
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
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    addHistory(`🎲 ${currentPlayer.name} rolled a ${diceValue}.`);
    
    const validMoves = calculateValidMoves(currentPlayer, diceValue, gameState.tokens);

    setGameState(prev => prev ? ({ ...prev, diceValue, validMoves, turnState: validMoves.length > 0 ? 'moving' : 'rolling' }) : null);

    if (validMoves.length === 0) {
      toast({ title: "No valid moves!", description: `${currentPlayer.name} can't move.` });
      setTimeout(nextTurn, 1500);
    }
  }, [gameState, calculateValidMoves, nextTurn, toast]);

  const restartGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  const isMyTurn = useMemo(() => {
    if (!gameState) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer.type === 'human';
  }, [gameState]);
  
  // AI Turn Logic
  useEffect(() => {
    if (!gameState || gameState.winner) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type === 'ai' && gameState.turnState === 'rolling') {
      setGameState(prev => prev ? ({ ...prev, turnState: 'ai-thinking' }) : null);
      
      const performAiTurn = async () => {
        await new Promise(res => setTimeout(res, 500));
        
        const diceValue = Math.floor(Math.random() * 6) + 1;
        addHistory(`🎲 (AI) ${currentPlayer.name} rolled a ${diceValue}.`);
        
        const validMoves = calculateValidMoves(currentPlayer, diceValue, gameState.tokens);

        setGameState(prev => prev ? ({ ...prev, diceValue, validMoves }) : null);

        if (validMoves.length === 0) {
          toast({ title: "No valid moves!", description: `(AI) ${currentPlayer.name} has no moves.` });
          setTimeout(nextTurn, 1000);
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
            // Fallback if AI fails
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            moveToken(randomMove.tokenId);
        }
      };
      
      performAiTurn();
    }
  }, [gameState, calculateValidMoves, moveToken, nextTurn, toast]);

  return { gameState, rollDice, moveToken, restartGame, isMyTurn };
}
