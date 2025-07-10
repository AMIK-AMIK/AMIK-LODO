
"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { GameConfig } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Link, QrCode, ClipboardCopy, Check } from "lucide-react";
import QRCode from "qrcode.react";

export default function GameLobby({ params }: { params: { gameId: string } }) {
  const { gameId } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchGameConfig = async () => {
      setLoading(true);
      try {
        const gameDocRef = doc(db, "games", gameId);
        const docSnap = await getDoc(gameDocRef);
        if (docSnap.exists()) {
          setGameConfig(docSnap.data() as GameConfig);
        } else {
          setError("Game not found. It may have been deleted or never existed.");
        }
      } catch (e) {
        console.error("Error fetching game:", e);
        setError("Failed to load game data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameConfig();
  }, [gameId, user, authLoading, router]);

  const gameUrl = typeof window !== 'undefined' ? `${window.location.origin}/game/${gameId}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || authLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Game Lobby...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
         <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
                <Button onClick={() => router.push('/')} className="mt-6">Back to Home</Button>
            </CardContent>
         </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background to-secondary/50">
      <Card className="w-full max-w-lg shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Game Lobby</CardTitle>
          <CardDescription>Share this with other players to have them join!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 p-4 rounded-lg bg-secondary/50">
            <h3 className="text-lg font-semibold flex items-center gap-2"><QrCode/> Scan QR Code</h3>
            <div className="p-4 bg-white rounded-lg">
              <QRCode value={gameUrl} size={200} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-center flex items-center gap-2 justify-center"><Link/> Or Share Link</h3>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
              <input type="text" value={gameUrl} readOnly className="flex-grow bg-background/50 p-2 rounded-md text-sm truncate"/>
              <Button onClick={copyToClipboard} size="icon" variant="ghost">
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <ClipboardCopy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="text-center text-muted-foreground text-sm">
            <p>Players in lobby: 1 / {gameConfig?.players.length}</p>
            <p className="mt-2">(Real-time lobby feature coming soon!)</p>
          </div>

          <Button
            size="lg"
            className="w-full font-bold text-lg"
            onClick={() => router.push(`/game/${gameId}`)}
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
