"use client"

import type React from "react"
import { useRef } from "react"
import { useLineupStore } from "@/lib/store"
import type { Role, Lineup } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2, Download, Upload } from "lucide-react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LineupManager() {
  const { lineup, removeHero, toggleEditMode, editMode, clearLineup, importLineup } = useLineupStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const roles: Role[] = ["HC", "Mid", "Offlane", "Support 4", "Support 5"]

  const exportLineup = () => {
    const dataStr = JSON.stringify(lineup)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "dota-lineup.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedLineup = JSON.parse(e.target?.result as string) as Lineup
        importLineup(importedLineup)
      } catch (error) {
        console.error("Error importing lineup:", error)
        alert("Invalid lineup file format")
      }
    }
    reader.readAsText(file)

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Your Lineup</CardTitle>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <Switch id="edit-mode" checked={editMode} onCheckedChange={toggleEditMode} />
              <Label htmlFor="edit-mode" className="text-sm">
                {editMode ? "Edit Mode" : "View Mode"}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={exportLineup}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export lineup</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleImportClick}>
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Import lineup</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start mb-4 overflow-x-auto">
            <TabsTrigger value="all">All Roles</TabsTrigger>
            {roles.map((role) => (
              <TabsTrigger key={role} value={role}>
                {role} ({lineup[role].length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {roles.map((role) => (
              <div key={role} className="space-y-2">
                <h3 className="text-sm font-medium flex items-center justify-between">
                  <span>{role}</span>
                  <span className="text-xs text-muted-foreground">{lineup[role].length} heroes</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {lineup[role].length > 0 ? (
                    lineup[role].map((hero) => (
                      <div key={hero.id} className="relative group bg-card border rounded-md overflow-hidden">
                        <div className="relative h-14 w-24">
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
                          <p className="text-xs truncate max-w-[96px]">{hero.localized_name}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic w-full py-2 px-3 border rounded-md">
                      No heroes selected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {roles.map((role) => (
            <TabsContent key={role} value={role}>
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center justify-between">
                  <span>{role}</span>
                  <span className="text-xs text-muted-foreground">{lineup[role].length} heroes</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {lineup[role].length > 0 ? (
                    lineup[role].map((hero) => (
                      <div key={hero.id} className="relative group bg-card border rounded-md overflow-hidden">
                        <div className="relative h-20 w-36">
                          <Image
                            src={hero.img || "/placeholder.svg"}
                            alt={hero.localized_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {editMode && (
                              <Button variant="destructive" size="icon" onClick={() => removeHero(role, hero.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="p-2 text-center">
                          <p className="text-sm truncate">{hero.localized_name}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic w-full py-4 px-3 border rounded-md text-center">
                      No heroes selected for {role}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
