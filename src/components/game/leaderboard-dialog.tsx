"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, Trophy } from "lucide-react"

interface LeaderboardEntry {
  name: string;
  wins: number;
}

export function LeaderboardDialog() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    try {
      const savedLeaderboard = localStorage.getItem("ludoLeaderboard")
      if (savedLeaderboard) {
        setLeaderboard(JSON.parse(savedLeaderboard))
      }
    } catch (error) {
      console.error("Could not load leaderboard from local storage:", error)
    }
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <BarChart3 className="mr-2 h-4 w-4" />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Leaderboard</DialogTitle>
          <DialogDescription>
            Top players on this device.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {leaderboard.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Wins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard
                  .sort((a, b) => b.wins - a.wins)
                  .map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {index === 0 ? <Trophy className="text-yellow-400 w-5 h-5"/> : index + 1}
                      </TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell className="text-right">{entry.wins}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No games played yet. Be the first!</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const updateLeaderboard = (winnerName: string) => {
    try {
        const savedLeaderboard = localStorage.getItem("ludoLeaderboard");
        let leaderboard: LeaderboardEntry[] = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
        
        const playerIndex = leaderboard.findIndex(p => p.name === winnerName);

        if (playerIndex > -1) {
            leaderboard[playerIndex].wins += 1;
        } else {
            leaderboard.push({ name: winnerName, wins: 1 });
        }

        localStorage.setItem("ludoLeaderboard", JSON.stringify(leaderboard));
    } catch (error) {
        console.error("Could not update leaderboard in local storage:", error);
    }
};
