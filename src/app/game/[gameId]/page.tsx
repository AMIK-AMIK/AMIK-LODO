
"use client"

import { Suspense } from 'react';
import GameBoard from '../_components/game-board';

function GamePage({ params }: { params: { gameId: string } }) {
  const { gameId } = params;
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-2 sm:p-4">
       <h1 className="text-3xl font-bold mb-4 text-primary">AMIK LODO</h1>
       <GameBoard gameId={gameId} />
    </main>
  );
}

export default function GamePageWithSuspense({ params }: { params: { gameId: string } }) {
  return (
    <Suspense fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-2 sm:p-4">
            <h1 className="text-3xl font-bold mb-4 text-primary">AMIK LODO</h1>
            <p>Loading Game...</p>
        </div>
    }>
      <GamePage params={params} />
    </Suspense>
  )
}
