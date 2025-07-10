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
import { BarChart3, Trophy, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, getDoc, setDoc, increment } from "firebase/firestore"

interface LeaderboardEntry {
  id: string; // Player name
  wins: number;
}

export function LeaderboardDialog() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "leaderboard"));
      const board: LeaderboardEntry[] = [];
      querySnapshot.forEach((doc) => {
        board.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
      });
      setLeaderboard(board.sort((a, b) => b.wins - a.wins));
    } catch (error) {
      console.error("Could not load leaderboard from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchLeaderboard()}>
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
            Top players from around the world.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
             <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : leaderboard.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Wins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {index === 0 ? <Trophy className="text-yellow-400 w-5 h-5"/> : index + 1}
                      </TableCell>
                      <TableCell>{entry.id}</TableCell>
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

export const updateLeaderboard = async (winnerName: string) => {
    if (!winnerName || winnerName.trim() === "") return;
    const leaderboardRef = collection(db, "leaderboard");
    const playerDocRef = doc(leaderboardRef, winnerName);
    
    try {
        const playerDoc = await getDoc(playerDocRef);
        if (playerDoc.exists()) {
            await setDoc(playerDocRef, { wins: increment(1) }, { merge: true });
        } else {
            await setDoc(playerDocRef, { wins: 1 });
        }
        console.log(`Leaderboard updated for ${winnerName}`);
    } catch (error) {
        console.error("Could not update leaderboard in Firestore:", error);
    }
};
