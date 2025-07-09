// Note: The full game logic is complex and will be added in subsequent steps.
// This file sets up the structure and basic components for the game page.
"use client"

import { Suspense } from 'react';
import GameBoard from './_components/game-board';

function GamePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <h1 className="text-3xl font-bold mb-4 text-primary">Ludo Champ</h1>
       <GameBoard />
    </main>
  );
}

export default function GamePageWrapper() {
  return (
    <Suspense fallback={<div>Loading game...</div>}>
      <GamePage />
    </Suspense>
  )
}
