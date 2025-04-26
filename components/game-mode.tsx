"use client"

import { useState } from "react"
import { useLineupStore } from "@/lib/store"
import type { Role } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dice5, RefreshCw } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export function GameMode() {
  const { lineup } = useLineupStore()
  const [selectedRole, setSelectedRole] = useState<Role>("HC")
  const [randomHero, setRandomHero] = useState<any | null>(null)
  const [isRandomizing, setIsRandomizing] = useState(false)

  const roles: Role[] = ["HC", "Mid", "Offlane", "Support 4", "Support 5"]

  const handleRandomize = () => {
    const heroesInRole = lineup[selectedRole]

    if (heroesInRole.length === 0) {
      setRandomHero(null)
      return
    }

    setIsRandomizing(true)

    // Simulate a randomization animation
    let count = 0
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * heroesInRole.length)
      setRandomHero(heroesInRole[randomIndex])
      count++

      if (count > 10) {
        clearInterval(interval)
        setIsRandomizing(false)
      }
    }, 100)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Game Mode</CardTitle>
        <CardDescription>Randomly select a hero from your lineup for a specific role</CardDescription>
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

            <Button onClick={handleRandomize} disabled={isRandomizing || lineup[selectedRole].length === 0}>
              {isRandomizing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Dice5 className="h-4 w-4 mr-2" />}
              Randomize
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {randomHero ? (
              <motion.div
                key={randomHero.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-card border rounded-lg overflow-hidden"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={randomHero.img || "/placeholder.svg"}
                    alt={randomHero.localized_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{randomHero.localized_name}</h3>
                    <p className="text-sm opacity-90">{selectedRole} Role</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-6 border rounded-lg flex flex-col items-center justify-center min-h-[160px]"
              >
                <Dice5 className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {lineup[selectedRole].length === 0
                    ? `No heroes available for ${selectedRole} role`
                    : "Click randomize to pick a hero"}
                </p>
                {lineup[selectedRole].length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Add heroes to this role in the Hero Selection section below
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
