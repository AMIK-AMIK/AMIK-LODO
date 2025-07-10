
"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Users, Cpu, PersonStanding, Info, BarChart3, Crown, Bot, Loader2, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HowToPlayDialog } from "@/components/game/how-to-play-dialog"
import { LeaderboardDialog } from "@/components/game/leaderboard-dialog"
import type { Player, PlayerType, PlayerColor, GameConfig } from "@/lib/types"
import { db } from "@/lib/firebase"
import { collection, addDoc, doc, setDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

const ALL_COLORS: PlayerColor[] = ["red", "green", "yellow", "blue"];

function UserProfile() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return <Skeleton className="w-full h-12" />
    }

    if (!user) return null;

    const displayName = user.isAnonymous ? "Guest Player" : user.displayName || "User";
    const displayEmail = user.isAnonymous ? "Playing as a guest" : user.email;

    return (
        <div className="flex items-center justify-between w-full max-w-md mb-8 p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={user.photoURL || undefined} alt={displayName} />
                    <AvatarFallback>{user.isAnonymous ? <User className="w-5 h-5"/> : displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{displayName}</p>
                    {displayEmail && <p className="text-sm text-muted-foreground">{displayEmail}</p>}
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
                <LogOut className="w-5 h-5" />
            </Button>
        </div>
    )
}


export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth();
  const [numPlayers, setNumPlayers] = useState<number>(4)
  const [players, setPlayers] = useState<Player[]>([])
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
       const creatorName = user.isAnonymous ? `Guest (${user.uid.substring(0, 4)})` : user.displayName || 'Player 1';
       setPlayers([
        { id: 1, type: 'human', color: 'red', name: creatorName, uid: user.uid },
        { id: 2, type: 'ai', color: 'green', name: 'AI Bot 1' },
        { id: 3, type: 'ai', color: 'yellow', name: 'AI Bot 2' },
        { id: 4, type: 'ai', color: 'blue', name: 'AI Bot 3' },
      ])
    }
  }, [user]);

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
            const isHuman = newPlayers.filter(p => p.type === 'human').length === 0;
            newPlayers.push({ 
                id: i + 1, 
                type: isHuman ? 'human' : 'ai', 
                color: availableColor, 
                name: isHuman ? 'Another Player' : `AI Bot ${i+1}` 
            });
            usedColors.add(availableColor);
        }
      }
      return newPlayers
    })
  }

  const handlePlayerTypeChange = (index: number, type: PlayerType) => {
    setPlayers(currentPlayers => {
      const newPlayers = [...currentPlayers]
      const oldPlayer = newPlayers[index];

      // If we are changing the last human to an AI, prevent it
      const humanPlayers = newPlayers.filter(p => p.type === 'human');
      if (oldPlayer.type === 'human' && type === 'ai' && humanPlayers.length <= 1) {
          // You can't remove the last human player
          return currentPlayers;
      }

      newPlayers[index].type = type
      // Reset name on type change
      if (type === 'human') {
        newPlayers[index].name = `Player ${index + 1}`;
        newPlayers[index].uid = undefined; // Or a placeholder
      } else {
        newPlayers[index].name = `AI Bot ${index + 1}`;
        delete newPlayers[index].uid;
      }
      return newPlayers
    })
  }
  
  const handleColorChange = (index: number, newColor: PlayerColor) => {
    setPlayers(currentPlayers => {
      const newPlayers = [...currentPlayers];
      const oldColor = newPlayers[index].color;
      const targetPlayerIndex = newPlayers.findIndex(p => p.color === newColor && p.id !== newPlayers[index].id);

      if (targetPlayerIndex !== -1) {
        newPlayers[targetPlayerIndex].color = oldColor;
      }
      newPlayers[index].color = newColor;
      
      return newPlayers;
    });
  };

  const handleNameChange = (index: number, name: string) => {
    setPlayers(currentPlayers => {
      const newPlayers = [...currentPlayers]
      newPlayers[index].name = name;
      return newPlayers;
    })
  }

  const handleStartGame = useCallback(async () => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to create a game.", variant: "destructive" });
        return;
    }
    const humanPlayers = players.filter(p => p.type === 'human');
    if (humanPlayers.length === 0) {
        toast({ title: "Error", description: "At least one human player is required.", variant: "destructive" });
        return;
    }

    setIsCreating(true);

    const finalPlayers = players.slice(0, numPlayers).map(p => {
        if (p.type === 'human' && p.uid === user.uid) {
            const creatorName = user.isAnonymous ? `Guest (${user.uid.substring(0, 4)})` : user.displayName || p.name;
            return { ...p, name: creatorName };
        }
        return p;
    });
    
    // Create a new document reference with a unique ID
    const newGameRef = doc(collection(db, "games"));
    const newGameId = newGameRef.id;

    // Navigate immediately
    router.push(`/game/lobby/${newGameId}`);

    // Save the game document in the background
    try {
        const gameConfig: GameConfig = { players: finalPlayers };
        await setDoc(newGameRef, {
            ...gameConfig,
            createdAt: new Date(),
            creatorUid: user.uid
        });
    } catch (error) {
        console.error("Error creating game in background:", error);
        // If this fails, the user is already on the lobby page.
        // The lobby page will show an error because it can't find the game.
        // We can also show a toast here.
        toast({
            title: "Creation Error",
            description: "Could not save the game. Please go back and try again.",
            variant: "destructive",
        });
    } finally {
        // We might not need to set isCreating to false if we've already navigated away.
        // But it's good practice in case the navigation is interrupted.
        setIsCreating(false);
    }
}, [players, numPlayers, user, router, toast]);

  if (loading || !user || players.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gradient-to-br from-background to-secondary/50">
      <div className="flex items-center gap-4 mb-8">
        <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
        <div>
          <h1 className="text-5xl sm:text-7xl font-bold text-primary-foreground font-headline tracking-tighter">
            AMIK LODO
          </h1>
          <p className="text-md sm:text-lg text-muted-foreground mt-1">The Modern Ludo Experience</p>
        </div>
      </div>
      
      <UserProfile />

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
            {players.slice(0, numPlayers).map((player, index) => (
              <div key={player.id} className="flex flex-col gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                            <button className={`w-6 h-6 rounded-full bg-ludo-${player.color} border-2 border-white/50 cursor-pointer hover:scale-110 transition-transform`} aria-label={`Change color for Player ${player.id}`}/>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                                <div className="flex gap-2">
                                    {ALL_COLORS.map(color => (
                                        <button key={color} onClick={() => handleColorChange(index, color)} className={`w-8 h-8 rounded-full bg-ludo-${color} border-2 ${player.color === color ? 'border-white' : 'border-transparent'} transition-all hover:scale-110`}/>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Label htmlFor={`player-type-${index}`} className={`font-bold text-ludo-${player.color}`}>
                           {player.type === 'human' && player.uid === user.uid ? 'You' : `Player ${index + 1}`}
                        </Label>
                    </div>
                    <Select onValueChange={(type: PlayerType) => handlePlayerTypeChange(index, type)} defaultValue={player.type} disabled={player.uid === user.uid}>
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
                {player.type === 'human' && (
                    <div className="flex items-center gap-2">
                        <Input 
                            id={`player-name-${index}`}
                            placeholder="Enter player name"
                            value={player.name}
                            onChange={(e) => handleNameChange(index, e.target.value)}
                            className="bg-background/50"
                            disabled={player.uid === user.uid}
                        />
                    </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button size="lg" className="w-full font-bold text-lg" onClick={handleStartGame} disabled={isCreating}>
            {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isCreating ? "Creating Game..." : "Create Game & Invite"}
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
