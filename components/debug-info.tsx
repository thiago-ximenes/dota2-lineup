"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLineupStore } from "@/lib/store"

export function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false)
  const { lineup } = useLineupStore()

  const sampleHero =
    lineup.HC[0] || lineup.Mid[0] || lineup.Offlane[0] || lineup["Support 4"][0] || lineup["Support 5"][0]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? "Hide Debug" : "Show Debug"}
      </Button>

      {showDebug && (
        <Card className="mt-2 w-[400px] max-w-[90vw] max-h-[80vh] overflow-auto">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Sample Hero Image Path:</h3>
                {sampleHero ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs break-all">
                      <span className="font-semibold">Name:</span> {sampleHero.localized_name}
                    </p>
                    <p className="text-xs break-all">
                      <span className="font-semibold">Image URL:</span> {sampleHero.img}
                    </p>
                    <p className="text-xs break-all">
                      <span className="font-semibold">Icon URL:</span> {sampleHero.icon}
                    </p>
                    <div className="mt-2">
                      <p className="text-xs font-semibold mb-1">Image Preview:</p>
                      <img
                        src={sampleHero.img || "/placeholder.svg"}
                        alt={sampleHero.localized_name}
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No heroes in lineup to display</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
