
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Loader2 } from "lucide-react"

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || user) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

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

        <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome!</CardTitle>
                <CardDescription className="text-center">
                    Sign in to start playing and track your victories.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                    size="lg" 
                    className="w-full font-bold text-lg"
                    onClick={loginWithGoogle}
                >
                    <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.8 56.2l-65.4 64.2C335.5 99.4 294.8 84 248 84c-85.8 0-155.1 69.4-155.1 172s69.3 172 155.1 172c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                    Sign in with Google
                </Button>
            </CardContent>
        </Card>
    </main>
  )
}
