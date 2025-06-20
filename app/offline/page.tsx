"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw, Heart } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-3 bg-orange/10 rounded-full w-fit">
            <WifiOff className="h-8 w-8 text-orange" />
          </div>
          <CardTitle className="text-2xl text-charcoal">You're Offline</CardTitle>
          <CardDescription className="text-grey">
            It looks like you've lost your internet connection. Don't worry, you can still view some of your pet
            information that's been saved locally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-cream rounded-lg border border-grey/20">
            <Heart className="h-6 w-6 text-teal mx-auto mb-2" />
            <p className="text-sm text-charcoal">
              Your pet's basic information and recent data are still available while offline.
            </p>
          </div>

          <Button onClick={() => window.location.reload()} className="w-full bg-orange hover:bg-orange/90 text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <div className="text-xs text-grey">
            <p>Available offline:</p>
            <ul className="mt-2 space-y-1">
              <li>• Pet profiles</li>
              <li>• Recent appointments</li>
              <li>• Cached notifications</li>
              <li>• Emergency contacts</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
