"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { GameState, Token, Player, GameConfig, TokenPosition, PlayerColor } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { getAiMove } from '@/app/actions'
import { updateLeaderboard } from '@/components/game/leaderboard-dialog'
import {
  getInitialTokens,
  getTrackPath,
  getHomeStretchPath,
  isSafeZone,
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
    setGameState(prev => prev ? ({ ...prev, gameHistory: [...prev.gameHistory, log] }) : null);
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
        const occupiedTokenIndex = newTokens.findIndex(
          t => t.position.type === 'track' && t.position.index === move.newPosition.index && t.color !== currentToken.color
        )
        if (occupiedTokenIndex !== -1) {
          const capturedToken = newTokens[occupiedTokenIndex]
          const capturedPlayer = prev.players.find(p => p.color === capturedToken.color)!
          newTokens[occupiedTokenIndex].position = { type: 'base', index: capturedToken.id % 4 }
          addHistory(`⚔️ ${currentPlayer.name} captured ${capturedPlayer.name}'s token!`)
        }
      }

      newTokens[currentTokenIndex].position = move.newPosition
      addHistory(`➡️ ${currentPlayer.name} moved a token.`)

      checkForWinner(newTokens, currentPlayer);

      if (prev.diceValue === 6) {
        return {
          ...prev,
          tokens: newTokens,
          turnState: 'rolling',
          diceValue: null,
          validMoves: [],
        }
      } else {
        // This needs to be deferred to allow state update to render
        setTimeout(nextTurn, 100);
        return { ...prev, tokens: newTokens, turnState: 'rolling' };
      }
    })
  }, [nextTurn, checkForWinner])

  const calculateValidMoves = useCallback((player: Player, diceValue: number, tokens: Token[]) => {
    const playerTokens = tokens.filter(t => t.color === player.color)
    const validMoves: { tokenId: number; newPosition: TokenPosition }[] = []

    for (const token of playerTokens) {
      if (token.position.type === 'base') {
        if (diceValue === 6) {
          validMoves.push({ tokenId: token.id, newPosition: getTrackPath(player.color, 0) })
        }
      } else if (token.position.type === 'track') {
        const newTrackPos = getTrackPath(player.color, token.position.index + diceValue)
        if (newTrackPos) {
           validMoves.push({ tokenId: token.id, newPosition: newTrackPos })
        } else {
            const overflow = (token.position.index + diceValue) - 52;
            const homeStretchPos = getHomeStretchPath(player.color, overflow);
            if (homeStretchPos) {
                validMoves.push({ tokenId: token.id, newPosition: homeStretchPos });
            }
        }
      } else if (token.position.type === 'home-stretch') {
        const newHomePos = getHomeStretchPath(player.color, token.position.index + diceValue)
        if (newHomePos) {
          validMoves.push({ tokenId: token.id, newPosition: newHomePos })
        }
      }
    }
    return validMoves
  }, []);

  const rollDice = useCallback(() => {
    if (!gameState || gameState.turnState !== 'rolling') return

    const diceValue = Math.floor(Math.random() * 6) + 1
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    addHistory(`🎲 ${currentPlayer.name} rolled a ${diceValue}.`)
    
    const validMoves = calculateValidMoves(currentPlayer, diceValue, gameState.tokens)

    setGameState(prev => prev ? ({ ...prev, diceValue, validMoves, turnState: 'moving' }) : null);

    if (validMoves.length === 0) {
      toast({ title: "No valid moves!", description: `${currentPlayer.name} has no moves and forfeits the turn.` })
      setTimeout(nextTurn, 1500)
    }
  }, [gameState, calculateValidMoves, nextTurn, toast])

  const restartGame = useCallback(() => {
    initializeGame()
  }, [initializeGame])

  const isMyTurn = useMemo(() => {
    if (!gameState) return false
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    return currentPlayer.type === 'human'
  }, [gameState])
  
  // AI Turn Logic
  useEffect(() => {
    if (!gameState || gameState.winner) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.type === 'ai' && gameState.turnState === 'rolling') {
      setGameState(prev => prev ? ({ ...prev, turnState: 'ai-thinking' }) : null);
      
      const performAiTurn = async () => {
        // AI rolls dice
        const diceValue = Math.floor(Math.random() * 6) + 1
        addHistory(`🎲 (AI) ${currentPlayer.name} rolled a ${diceValue}.`)
        await new Promise(res => setTimeout(res, 1000));
        
        const validMoves = calculateValidMoves(currentPlayer, diceValue, gameState.tokens)

        setGameState(prev => prev ? ({ ...prev, diceValue, validMoves, turnState: 'ai-thinking' }) : null);

        if (validMoves.length === 0) {
          toast({ title: "No valid moves!", description: `(AI) ${currentPlayer.name} has no moves.` })
          setTimeout(nextTurn, 1500)
          return;
        }

        // AI chooses move
        const boardState = JSON.stringify(gameState.tokens.map(t => ({id: t.id, pos: t.position})));
        const bestMove = await getAiMove(boardState, validMoves, currentPlayer.name);
        
        await new Promise(res => setTimeout(res, 1000));
        
        if (bestMove) {
          moveToken(bestMove.tokenId);
        } else {
            // Should not happen if validMoves.length > 0, but as a fallback
            nextTurn();
        }
      };
      
      setTimeout(performAiTurn, 1000);
    }
  }, [gameState, calculateValidMoves, moveToken, nextTurn, toast]);

  return { gameState, rollDice, moveToken, restartGame, isMyTurn }
}
