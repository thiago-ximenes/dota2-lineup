"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useLineupStore } from "@/lib/store"
import type { Role, Lineup } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2, Download, Upload, AlertCircle, Check } from "lucide-react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export function LineupManager() {
  const { 
    lineup, 
    removeHero, 
    toggleEditMode, 
    editMode, 
    clearLineup, 
    importLineup,
    selectedPositions,
    togglePositionFilter,
    clearPositionFilter 
  } = useLineupStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const roles: Role[] = ["HC", "Mid", "Offlane", "Support 4", "Support 5"]

  // Function to get position color
  const getPositionColor = (role: Role): string => {
    switch (role) {
      case "HC": return "bg-green-500 hover:bg-green-600 border-green-400";
      case "Mid": return "bg-blue-500 hover:bg-blue-600 border-blue-400";
      case "Offlane": return "bg-orange-500 hover:bg-orange-600 border-orange-400";
      case "Support 4": return "bg-yellow-500 hover:bg-yellow-600 border-yellow-400";
      case "Support 5": return "bg-pink-500 hover:bg-pink-600 border-pink-400";
      default: return "";
    }
  };

  // Get position name/label in a more readable format
  const getPositionLabel = (role: Role): string => {
    switch (role) {
      case "HC": return "Carry";
      case "Mid": return "Mid";
      case "Offlane": return "Off";
      case "Support 4": return "Sup 4";
      case "Support 5": return "Sup 5";
      default: return role;
    }
  };

  // Position filter helper functions
  const isPositionSelected = (role: Role): boolean => {
    return selectedPositions.includes(role);
  };

  const shouldShowRole = (role: Role): boolean => {
    // If no positions selected, show all roles
    if (selectedPositions.length === 0) return true;
    // Otherwise only show selected positions
    return selectedPositions.includes(role);
  };

  // Check if any heroes are selected in any role
  const hasAnyHeroes = Object.values(lineup).some(heroes => heroes.length > 0);
  
  // Get positions that have heroes
  const positionsWithHeroes = roles.filter(role => lineup[role].length > 0);
  
  // Handle hero removal and update filters if needed
  const handleRemoveHero = (role: Role, heroId: number) => {
    removeHero(role, heroId);
    
    // Check if this was the last hero in this role
    setTimeout(() => {
      const roleIsEmpty = lineup[role].length === 0;
      
      // If the role is now empty and it was selected in the filter, remove it from filter
      if (roleIsEmpty && selectedPositions.includes(role)) {
        togglePositionFilter(role);
      }
    }, 0);
  };

  // Original lineup functions
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

  const handleImageError = (heroId: number, role: Role) => {
    console.error(`Failed to load image for hero ID: ${heroId} in role ${role}`)
    setImageErrors((prev) => ({ ...prev, [`${role}-${heroId}`]: true }))
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
        {/* Position filter chips - only show when heroes exist */}
        {hasAnyHeroes ? (
          <>
            {positionsWithHeroes.length > 0 && (
              <div className="mb-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium">Filter by position</h3>
                  <div className="flex flex-wrap gap-2">
                    {positionsWithHeroes.map((role) => (
                      <TooltipProvider key={role}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={`cursor-pointer flex gap-2 items-center px-3 py-2 transition-all duration-200 shadow-sm hover:shadow ${
                                isPositionSelected(role)
                                  ? `${getPositionColor(role)} ring-2 ring-offset-2 ring-offset-background ring-${getPositionColor(role).split(' ')[0].replace('bg-', '')}`
                                  : "bg-card hover:bg-card/80 border-border"
                              }`}
                              onClick={() => togglePositionFilter(role)}
                            >
                              <div className={`w-2.5 h-2.5 rounded-full ${getPositionColor(role).split(' ')[0]}`} />
                              <span className={isPositionSelected(role) ? "text-white font-medium" : "text-foreground"}>
                                {getPositionLabel(role)}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isPositionSelected(role) ? "bg-white/20" : "bg-muted"}`}>
                                {lineup[role].length}
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="font-medium">
                            {isPositionSelected(role) ? `Hide ${role} heroes` : `Show ${role} heroes`}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {selectedPositions.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearPositionFilter}
                        className="text-xs h-9 gap-2 flex items-center"
                      >
                        <span>Clear filters</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Heroes display - each role is a section */}
            <div className="space-y-8">
              {roles
                .filter(role => lineup[role].length > 0) // Mostra apenas posições com heróis
                .filter(shouldShowRole) // Aplica o filtro de posições selecionadas
                .map((role) => (
                <div key={role} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPositionColor(role).split(' ')[0]}`}></div>
                      <h3 className="text-base font-medium">{role}</h3>
                    </div>
                    <span className="text-sm text-muted-foreground">{lineup[role].length} heroes</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {lineup[role].map((hero) => (
                      <div key={hero.id} className="relative group bg-card border rounded-md overflow-hidden">
                        <div className="relative h-20 w-36">
                          {imageErrors[`${role}-${hero.id}`] ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mb-1" />
                              <p className="text-xs text-center text-muted-foreground">{hero.localized_name}</p>
                            </div>
                          ) : (
                            <Image
                              src={hero.img || "/placeholder.svg"}
                              alt={hero.localized_name}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={() => handleImageError(hero.id, role)}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {editMode && (
                              <Button 
                                variant="destructive" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemoveHero(role, hero.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="p-2 text-center">
                          <p className="text-sm truncate">{hero.localized_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Show message when filter is active but no results */}
              {selectedPositions.length > 0 && roles.filter(shouldShowRole).length === 0 && (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground">No heroes found matching your filters.</p>
                  <Button
                    variant="link"
                    onClick={clearPositionFilter}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg mb-6 bg-muted/5 animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-2 max-w-md">
              <div className="p-3 rounded-full bg-muted/20 mb-2">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No Heroes In Your Lineup</h3>
              <p className="text-muted-foreground text-sm">
                Add some heroes to your lineup from the Hero Selection section to see them here.
                Once added, you can filter them by position.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  // Scroll to hero selection section smoothly
                  const heroSection = document.querySelector("#hero-selection");
                  if (heroSection) {
                    heroSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Go to Hero Selection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
