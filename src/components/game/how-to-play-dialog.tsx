"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Separator } from "../ui/separator"

export function HowToPlayDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Info className="mr-2 h-4 w-4" />
          How to Play
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to Play Ludo</DialogTitle>
          <DialogDescription>
            The objective is to get all four of your tokens from your start area to your home triangle.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-sm text-muted-foreground max-h-[60vh] overflow-y-auto pr-4">
          <section>
            <h3 className="font-semibold text-foreground mb-2">1. Getting Started</h3>
            <p>Each player chooses a color. The game can be played by 2 to 4 players. Players take turns in a clockwise order.</p>
          </section>
          <Separator />
          <section>
            <h3 className="font-semibold text-foreground mb-2">2. Rolling the Dice</h3>
            <p>To start your turn, click the dice. A roll of 6 gives you an extra turn.</p>
          </section>
          <Separator />
          <section>
            <h3 className="font-semibold text-foreground mb-2">3. Moving Tokens</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>You need to roll a 6 to move a token from your base onto the starting square.</li>
              <li>If you have movable tokens, they will be highlighted after your roll. Click a token to move it.</li>
              <li>If a token lands on a square occupied by an opponent's token, the opponent's token is sent back to their base.</li>
            </ul>
          </section>
          <Separator />
          <section>
            <h3 className="font-semibold text-foreground mb-2">4. Safe Zones</h3>
            <p>Squares marked with a star are safe zones. Tokens on these squares cannot be captured. If multiple tokens of the same color are on a safe zone, they form a block.</p>
          </section>
          <Separator />
          <section>
            <h3 className="font-semibold text-foreground mb-2">5. Winning the Game</h3>
            <p>To win, you must move all four of your tokens into your home triangle. You must roll the exact number to enter the home triangle. The first player to get all four tokens home wins!</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
