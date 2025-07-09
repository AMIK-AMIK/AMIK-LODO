"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback } from 'react'

import LudoBoard from '@/components/game/ludo-board'
import GameInfoPanel from '@/components/game/game-info-panel'
import WinnerDialog from '@/components/game/winner-dialog'
import { useGame } from '@/hooks/use-game'
import type { Player, GameConfig } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

function GameBoard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [config, setConfig] = useState<GameConfig | null>(null)

  useEffect(() => {
    const configStr = searchParams.get('config')
    if (configStr) {
      try {
        const decodedConfig = JSON.parse(atob(configStr))
        setConfig(decodedConfig)
      } catch (error) {
        console.error("Failed to parse game config:", error)
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [searchParams, router])

  const { gameState, rollDice, moveToken, restartGame, isMyTurn } = useGame(config)

  const handleRestart = useCallback(() => {
    restartGame()
    router.push('/')
  }, [restartGame, router]);

  if (!gameState || !config) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto items-start justify-center">
        <div className="w-full max-w-[600px] aspect-square">
           <Skeleton className="w-full h-full rounded-2xl" />
        </div>
        <div className="w-full lg:w-80 flex-shrink-0">
          <Skeleton className="w-full h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto items-start justify-center">
      <LudoBoard
        tokens={gameState.tokens}
        validMoves={gameState.turnState === 'moving' ? gameState.validMoves : []}
        onTokenMove={moveToken}
        isMyTurn={isMyTurn}
        currentPlayerColor={currentPlayer.color}
      />
      <GameInfoPanel
        gameState={gameState}
        onRollDice={rollDice}
        isMyTurn={isMyTurn}
        onRestart={handleRestart}
      />
      {gameState.winner && (
        <WinnerDialog
          winner={gameState.winner}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}

export default GameBoard
