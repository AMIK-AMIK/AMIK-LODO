"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Users, Cpu, PersonStanding, Info, BarChart3, Crown, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HowToPlayDialog } from "@/components/game/how-to-play-dialog"
import { LeaderboardDialog } from "@/components/game/leaderboard-dialog"
import type { Player, PlayerType, PlayerColor } from "@/lib/types"

const ALL_COLORS: PlayerColor[] = ["red", "green", "yellow", "blue"];

export default function HomePage() {
  const router = useRouter()
  const [numPlayers, setNumPlayers] = useState<number>(4)
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, type: 'human', color: 'red', name: 'Player 1' },
    { id: 2, type: 'ai', color: 'green', name: 'Player 2' },
    { id: 3, type: 'ai', color: 'yellow', name: 'Player 3' },
    { id: 4, type: 'ai', color: 'blue', name: 'Player 4' },
  ])

  const handleNumPlayersChange = (value: string) => {
    const count = parseInt(value, 10)
    setNumPlayers(count)
    setPlayers(currentPlayers => {
      const newPlayers: Player[] = []
      const usedColors = new Set<PlayerColor>();
      for (let i = 0; i < count; i++) {
        const existingPlayer = currentPlayers[i];
        if (existingPlayer) {
            newPlayers.push(existingPlayer);
            usedColors.add(existingPlayer.color);
        } else {
            const availableColor = ALL_COLORS.find(c => !usedColors.has(c))!;
            newPlayers.push({ id: i + 1, type: i === 0 ? 'human' : 'ai', color: availableColor, name: `Player ${i+1}` });
            usedColors.add(availableColor);
        }
      }
      return newPlayers
    })
  }

  const handlePlayerTypeChange = (index: number, type: PlayerType) => {
    setPlayers(currentPlayers => {
      const newPlayers = [...currentPlayers]
      newPlayers[index].type = type
      return newPlayers
    })
  }
  
  const handleColorChange = (index: number, newColor: PlayerColor) => {
    setPlayers(currentPlayers => {
      const newPlayers = [...currentPlayers];
      const oldColor = newPlayers[index].color;
      const targetPlayerIndex = newPlayers.findIndex(p => p.color === newColor && p.id !== newPlayers[index].id);

      // Swap colors with the other player
      if (targetPlayerIndex !== -1) {
        newPlayers[targetPlayerIndex].color = oldColor;
      }
      newPlayers[index].color = newColor;
      
      return newPlayers;
    });
  };


  const humanPlayerCount = useMemo(() => players.filter(p => p.type === 'human').length, [players]);

  const handleStartGame = useCallback(() => {
    if (humanPlayerCount === 0) {
      alert("At least one human player is required to start the game.");
      return;
    }
    const gameConfig = { players };
    const encodedConfig = btoa(JSON.stringify(gameConfig));
    router.push(`/game?config=${encodedConfig}`);
  }, [players, humanPlayerCount, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background to-secondary/50">
      <div className="flex items-center gap-4 mb-8">
        <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
        <div>
          <h1 className="text-5xl sm:text-7xl font-bold text-primary-foreground font-headline tracking-tighter">
            AMIK LODO
          </h1>
          <p className="text-md sm:text-lg text-muted-foreground mt-1">The Modern Ludo Experience</p>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2"><Users /> Game Setup</CardTitle>
          <CardDescription>Configure your match and start playing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="num-players">Number of Players</Label>
            <Select onValueChange={handleNumPlayersChange} defaultValue={String(numPlayers)}>
              <SelectTrigger id="num-players">
                <SelectValue placeholder="Select number of players" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Players</SelectItem>
                <SelectItem value="3">3 Players</SelectItem>
                <SelectItem value="4">4 Players</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild disabled={player.type !== 'human'}>
                       <button className={`w-6 h-6 rounded-full bg-ludo-${player.color} border-2 border-white/50 ${player.type === 'human' ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-not-allowed'}`} aria-label={`Change color for Player ${player.id}`}/>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="flex gap-2">
                            {ALL_COLORS.slice(0, numPlayers).map(color => (
                                <button key={color} onClick={() => handleColorChange(index, color)} className={`w-8 h-8 rounded-full bg-ludo-${color} border-2 ${player.color === color ? 'border-white' : 'border-transparent'} transition-all hover:scale-110`}/>
                            ))}
                        </div>
                    </PopoverContent>
                  </Popover>
                   <Label htmlFor={`player-type-${index}`} className={`font-bold text-ludo-${player.color}`}>
                     Player {player.id}
                   </Label>
                </div>
                <Select onValueChange={(type: PlayerType) => handlePlayerTypeChange(index, type)} defaultValue={player.type}>
                  <SelectTrigger id={`player-type-${index}`} className="w-[140px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">
                      <div className="flex items-center gap-2"><PersonStanding className="w-4 h-4" /> Human</div>
                    </SelectItem>
                    <SelectItem value="ai">
                      <div className="flex items-center gap-2"><Bot className="w-4 h-4" /> AI</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button size="lg" className="w-full font-bold text-lg" onClick={handleStartGame}>
            Start Game
          </Button>
          <div className="flex gap-4 w-full">
            <HowToPlayDialog />
            <LeaderboardDialog />
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}
