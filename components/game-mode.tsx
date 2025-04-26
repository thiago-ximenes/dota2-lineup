"use client"

import { useState } from "react"
import { useLineupStore } from "@/lib/store"
import type { Role } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dice5 } from "lucide-react"
import Image from "next/image"

export function GameMode() {
  const { lineup } = useLineupStore()
  const [selectedRole, setSelectedRole] = useState<Role>("HC")
  const [randomHero, setRandomHero] = useState<any | null>(null)

  const roles: Role[] = ["HC", "Mid", "Offlane", "Support 4", "Support 5"]

  const handleRandomize = () => {
    const heroesInRole = lineup[selectedRole]

    if (heroesInRole.length === 0) {
      setRandomHero(null)
      return
    }

    const randomIndex = Math.floor(Math.random() * heroesInRole.length)
    setRandomHero(heroesInRole[randomIndex])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Mode</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role} ({lineup[role].length} heroes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleRandomize}>
              <Dice5 className="h-4 w-4 mr-2" />
              Randomize
            </Button>
          </div>

          {randomHero ? (
            <div className="flex items-center gap-4 p-4 border rounded-md">
              <div className="relative h-16 w-28">
                <Image
                  src={randomHero.img || "/placeholder.svg"}
                  alt={randomHero.localized_name}
                  fill
                  className="object-cover rounded-md"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-bold">{randomHero.localized_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedRole} Role</p>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">
                {lineup[selectedRole].length === 0
                  ? "No heroes available for this role"
                  : "Click randomize to pick a hero"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
