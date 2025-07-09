"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { Player } from "@/lib/types"
import { Crown } from "lucide-react"

interface WinnerDialogProps {
  winner: Player
  onRestart: () => void
}

export default function WinnerDialog({ winner, onRestart }: WinnerDialogProps) {
  return (
    <AlertDialog open={!!winner}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-3xl font-bold flex flex-col items-center gap-4">
            <Crown className={`w-16 h-16 text-ludo-${winner.color}`} />
            Game Over!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg pt-2">
            Congratulations, <span className={`font-bold text-ludo-${winner.color}`}>{winner.name}</span>!
            <br />
            You are the Ludo champion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={onRestart} className="w-full text-lg font-semibold" size="lg">Play Again</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
