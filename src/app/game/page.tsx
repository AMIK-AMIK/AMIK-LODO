
"use client"

import { Suspense } from 'react';
import { redirect } from 'next/navigation';

export default function GamePageWrapper() {
  // This page is now dynamic and needs a gameId. 
  // If someone navigates here directly, redirect them to the home page.
  redirect('/');
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* This content will likely not be rendered due to the redirect. */}
      <div>Redirecting...</div>
    </Suspense>
  )
}

    