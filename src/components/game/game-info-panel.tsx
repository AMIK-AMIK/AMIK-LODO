"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import type { GameState } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Dice from '@/components/game/dice'
import { PersonStanding, Bot, Home, ScrollText, ArrowRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type GameInfoPanelProps = {
  gameState: GameState
  onRollDice: () => void
  isMyTurn: boolean
  onRestart: () => void
}

const PlayerStatus = ({ player, isCurrent }: { player: any; isCurrent: boolean }) => (
  <div
    className={cn(
        "flex items-center justify-between p-3 rounded-lg transition-all duration-300",
        isCurrent ? "bg-primary/20 border-primary/50 border animate-turn-pulse" : "bg-secondary/50"
    )}
  >
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full bg-ludo-${player.color}`} />
      <span className={`font-bold text-ludo-${player.color}`}>{player.name}</span>
      {player.type === 'ai' ? <Bot className="w-4 h-4 text-muted-foreground" /> : <PersonStanding className="w-4 h-4 text-muted-foreground" />}
    </div>
    {isCurrent && <ArrowRight className="w-5 h-5 text-primary animate-pulse" />}
  </div>
)

export default function GameInfoPanel({ gameState, onRollDice, isMyTurn, onRestart }: GameInfoPanelProps) {
  const router = useRouter()
  const { players, currentPlayerIndex, turnState, diceValue, gameHistory, winner } = gameState
  const currentPlayer = players[currentPlayerIndex]

  const handleGoHome = () => {
    if (confirm("Are you sure you want to leave the game? Your progress will be lost.")) {
      router.push('/')
    }
  }

  const turnText = () => {
    if (winner) return `${winner.name} wins!`
    if (turnState === 'ai-thinking') return `${currentPlayer.name} is thinking...`
    if (isMyTurn) {
        if (turnState === 'rolling') return "Your turn to roll!"
        if (turnState === 'moving') return "Choose a token to move."
    }
    return `${currentPlayer.name}'s Turn`
  }

  return (
    <Card className="w-full max-w-[600px] flex-shrink-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          {turnText()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-muted-foreground text-sm mb-2 text-center">Players</h3>
          {players.map(p => (
            <PlayerStatus key={p.id} player={p} isCurrent={p.id === currentPlayer.id && !winner} />
          ))}
        </div>

        <div className="flex justify-center">
          <Dice
            onRoll={onRollDice}
            value={diceValue}
            isRolling={turnState === 'rolling' && isMyTurn && !winner}
            isThinking={turnState === 'ai-thinking'}
          />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-muted-foreground text-sm flex items-center gap-2"><ScrollText className="w-4 h-4" /> Game Log</h3>
          <ScrollArea className="h-32 w-full rounded-md border p-3 text-sm">
            {gameHistory.length === 0 ? (
              <p className="text-muted-foreground text-center">Game has started!</p>
            ) : (
               gameHistory.map((log, i) => <p key={i} className="mb-1">{log}</p>)
            )}
          </ScrollArea>
        </div>

        <div className="flex flex-col space-y-2">
           <Button onClick={onRestart} variant="destructive">Restart Game</Button>
           <Button onClick={handleGoHome} variant="outline"><Home className="w-4 h-4 mr-2"/> Main Menu</Button>
        </div>
      </CardContent>
    </Card>
  )
}
