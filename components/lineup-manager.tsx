"use client"

import { useLineupStore } from "@/lib/store"
import type { Role } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function LineupManager() {
  const { lineup, removeHero, toggleEditMode, editMode, clearLineup } = useLineupStore()

  const roles: Role[] = ["HC", "Mid", "Offlane", "Support 4", "Support 5"]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Your Lineup</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="edit-mode" checked={editMode} onCheckedChange={toggleEditMode} />
              <Label htmlFor="edit-mode" className="text-sm">
                {editMode ? "Edit Mode" : "View Mode"}
              </Label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="icon" onClick={clearLineup}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear lineup</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role} className="space-y-2">
              <h3 className="text-sm font-medium">{role}</h3>
              <div className="flex flex-wrap gap-2">
                {lineup[role].length > 0 ? (
                  lineup[role].map((hero) => (
                    <div key={hero.id} className="relative group bg-card border rounded-md overflow-hidden">
                      <div className="relative h-12 w-20">
                        <Image
                          src={hero.img || "/placeholder.svg"}
                          alt={hero.localized_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {editMode && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeHero(role, hero.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="p-1 text-center">
                        <p className="text-xs truncate max-w-[80px]">{hero.localized_name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">No heroes selected</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
