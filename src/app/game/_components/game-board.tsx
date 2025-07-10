
"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { doc, getDoc } from "firebase/firestore";

import LudoBoard from '@/components/game/ludo-board'
import GameInfoPanel from '@/components/game/game-info-panel'
import WinnerDialog from '@/components/game/winner-dialog'
import { useGame } from '@/hooks/use-game'
import type { GameConfig } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

function GameBoard({ gameId }: { gameId: string }) {
  const router = useRouter()
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!gameId) {
        router.push('/');
        return;
    }

    const fetchGameConfig = async () => {
        setLoading(true);
        const gameDocRef = doc(db, "games", gameId);
        try {
            const docSnap = await getDoc(gameDocRef);
            if (docSnap.exists()) {
                setConfig(docSnap.data() as GameConfig);
            } else {
                console.error("No such game document!");
                toast({ title: "Error", description: "Game not found.", variant: "destructive" });
                router.push('/');
            }
        } catch (error) {
            console.error("Failed to fetch game config:", error);
            toast({ title: "Error", description: "Could not load game.", variant: "destructive" });
            router.push('/');
        } finally {
            setLoading(false);
        }
    }
    
    fetchGameConfig();
  }, [gameId, router, toast])

  const { gameState, rollDice, moveToken, restartGame, isMyTurn } = useGame(config)

  const handleRestart = useCallback(() => {
    // For now, restarting takes you to the main menu to create a new game.
    // In a future step, we could allow restarting the same game ID.
    router.push('/')
  }, [router]);

  if (loading || !gameState || !config) {
    return (
      <div className="flex flex-col gap-8 w-full items-center justify-center">
        <div className="w-full max-w-[600px] aspect-square">
           <Skeleton className="w-full h-full rounded-2xl" />
        </div>
        <div className="w-full max-w-[600px] flex-shrink-0">
          <Skeleton className="w-full h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="flex flex-col gap-8 w-full items-center justify-center">
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

    