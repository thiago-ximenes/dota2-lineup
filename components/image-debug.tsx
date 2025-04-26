"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchHeroes } from "@/lib/api"
import type { Hero } from "@/lib/types"

export function ImageDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [imageStatuses, setImageStatuses] = useState<Record<number, "loading" | "success" | "error">>({})

  useEffect(() => {
    if (isOpen && heroes.length === 0) {
      setIsLoading(true)
      fetchHeroes().then((data) => {
        setHeroes(data.slice(0, 5)) // Just get the first 5 heroes for testing
        setIsLoading(false)
      })
    }
  }, [isOpen, heroes])

  const handleImageLoad = (heroId: number) => {
    setImageStatuses((prev) => ({ ...prev, [heroId]: "success" }))
  }

  const handleImageError = (heroId: number) => {
    setImageStatuses((prev) => ({ ...prev, [heroId]: "error" }))
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          Debug Images
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[400px] max-w-[90vw] max-h-[80vh] overflow-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Image Debug</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {isLoading ? (
            <p>Loading hero data...</p>
          ) : heroes.length > 0 ? (
            <div className="space-y-4">
              {heroes.map((hero) => (
                <div key={hero.id} className="border rounded p-2">
                  <p className="font-semibold">
                    Hero ID: {hero.id} - {hero.localized_name}
                  </p>
                  <p className="break-all mt-1">
                    <span className="font-semibold">Image URL:</span> {hero.img}
                  </p>
                  <div className="mt-2">
                    <p className="font-semibold mb-1">Image Test:</p>
                    <div className="relative h-20 w-full border rounded overflow-hidden">
                      <img
                        src={hero.img || "/placeholder.svg"}
                        alt={hero.localized_name}
                        className="object-cover w-full h-full"
                        onLoad={() => handleImageLoad(hero.id)}
                        onError={() => handleImageError(hero.id)}
                      />
                    </div>
                    <p className="mt-1">
                      Status:
                      {!imageStatuses[hero.id] && " Loading..."}
                      {imageStatuses[hero.id] === "success" && " ✅ Loaded successfully"}
                      {imageStatuses[hero.id] === "error" && " ❌ Failed to load"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hero data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
