"use client"

import { useState, useMemo, useEffect } from "react"
import { useLineupStore } from "@/lib/store"
import type { Role } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dice5, RefreshCw, AlertCircle, Shuffle, Check, Plus, X } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

export function GameMode() {
  const { lineup } = useLineupStore()
  const [selectedRole, setSelectedRole] = useState<Role>("HC")
  const [randomHero, setRandomHero] = useState<any | null>(null)
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Multi-role randomization
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const [randomHeroes, setRandomHeroes] = useState<Record<Role, any | null>>({} as Record<Role, any | null>)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [isMultiMode, setIsMultiMode] = useState(false)

  const roles: Role[] = ["HC", "Mid", "Offlane", "Support 4", "Support 5"]
  
  // Check which roles have available heroes
  const rolesWithHeroes = useMemo(() => 
    roles.filter(role => lineup[role].length > 0),
    [lineup]
  )
  
  // Monitor changes in lineup and update selectedRoles accordingly
  useEffect(() => {
    // Filter out any selected roles that no longer have heroes
    setSelectedRoles(prev => 
      prev.filter(role => lineup[role].length > 0)
    )
  }, [lineup])
  
  // Get position color (reused from lineup-manager.tsx)
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

  // Single role randomization
  const handleRandomize = () => {
    const heroesInRole = lineup[selectedRole]

    if (heroesInRole.length === 0) {
      setRandomHero(null)
      return
    }

    setIsRandomizing(true)
    setImageError(false)

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
  
  // Multiple role randomization
  const handleMultiRandomize = () => {
    if (selectedRoles.length === 0) return
    
    setIsRandomizing(true)
    setImageErrors({})
    
    let tempHeroes: Record<Role, any | null> = {} as Record<Role, any | null>
    let count = 0
    
    // Initialize all selected roles with null
    selectedRoles.forEach(role => {
      tempHeroes[role] = null
    })
    
    setRandomHeroes(tempHeroes)
    
    // Simulate a randomization animation for all selected roles
    const interval = setInterval(() => {
      selectedRoles.forEach(role => {
        const heroesInRole = lineup[role]
        if (heroesInRole.length > 0) {
          const randomIndex = Math.floor(Math.random() * heroesInRole.length)
          tempHeroes[role] = heroesInRole[randomIndex]
        }
      })
      
      setRandomHeroes({...tempHeroes})
      count++
      
      if (count > 10) {
        clearInterval(interval)
        setIsRandomizing(false)
      }
    }, 100)
  }
  
  // Toggle role selection for multi-mode
  const toggleRoleSelection = (role: Role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role)
      } else {
        return [...prev, role]
      }
    })
  }

  const handleImageError = () => {
    console.error(`Failed to load image for random hero:`, randomHero?.id)
    setImageError(true)
  }
  
  const handleMultiImageError = (role: Role) => {
    console.error(`Failed to load image for random hero in role ${role}:`, randomHeroes[role]?.id)
    setImageErrors(prev => ({...prev, [role]: true}))
  }
  
  // Toggle between single and multi-mode
  const toggleMode = () => {
    // Reset states when toggling mode
    setIsMultiMode(!isMultiMode)
    setRandomHero(null)
    setRandomHeroes({})
    setImageError(false)
    setImageErrors({})
  }
  
  // Handle select all roles with available heroes
  const selectAllRoles = () => {
    setSelectedRoles(rolesWithHeroes)
  }
  
  // Handle clear all selected roles
  const clearSelectedRoles = () => {
    setSelectedRoles([])
    setRandomHeroes({})
  }

  return (
    <Card className="h-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Game Mode</CardTitle>
            <CardDescription>Randomly select heroes from your lineup</CardDescription>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleMode}
                  className={isMultiMode ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                >
                  {isMultiMode ? <Shuffle className="h-4 w-4 mr-2" /> : <Dice5 className="h-4 w-4 mr-2" />}
                  {isMultiMode ? "Multi-role" : "Single role"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMultiMode ? "Switch to single role mode" : "Switch to multi-role mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Single role mode UI */}
          {!isMultiMode && (
            <>
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role} disabled={lineup[role].length === 0}>
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
                    <div className="relative h-48 sm:h-56 w-full">
                      {imageError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4">
                          <AlertCircle className="h-6 w-6 text-muted-foreground mb-2" />
                          <p className="text-center text-muted-foreground">
                            Image could not be loaded for {randomHero.localized_name}
                          </p>
                        </div>
                      ) : (
                        <Image
                          src={randomHero.img || "/placeholder.svg"}
                          alt={randomHero.localized_name}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={handleImageError}
                        />
                      )}
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
                    className="text-center p-6 border rounded-lg flex flex-col items-center justify-center min-h-[180px]"
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
            </>
          )}
          
          {/* Multi-role mode UI */}
          {isMultiMode && (
            <>
              <div className="space-y-4">
                {/* Role selection chips */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Select positions to randomize:</label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={selectAllRoles}
                        disabled={rolesWithHeroes.length === 0}
                        className="h-8 text-xs"
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearSelectedRoles}
                        disabled={selectedRoles.length === 0}
                        className="h-8 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rolesWithHeroes.map((role) => {
                      const isSelected = selectedRoles.includes(role);
                      
                      return (
                        <TooltipProvider key={role}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={`cursor-pointer flex gap-2 items-center px-3 py-2 transition-all duration-200 shadow-sm hover:shadow 
                                  ${isSelected 
                                    ? `${getPositionColor(role)} ring-2 ring-offset-2 ring-offset-background ring-${getPositionColor(role).split(' ')[0].replace('bg-', '')}`
                                    : "bg-card hover:bg-card/80 border-border"
                                  }`}
                                onClick={() => toggleRoleSelection(role)}
                              >
                                <div className={`w-2.5 h-2.5 rounded-full ${getPositionColor(role).split(' ')[0]}`} />
                                <span className={isSelected ? "text-white font-medium" : "text-foreground"}>
                                  {getPositionLabel(role)}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20" : "bg-muted"}`}>
                                  {lineup[role].length}
                                </span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-medium">
                              {isSelected 
                                ? `Remove ${role} from randomization` 
                                : `Add ${role} to randomization`
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={selectedRoles.length === 0 || isRandomizing}
                  onClick={handleMultiRandomize}
                >
                  {isRandomizing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shuffle className="h-4 w-4 mr-2" />}
                  Randomize {selectedRoles.length} Position{selectedRoles.length !== 1 ? 's' : ''}
                </Button>
                
                <AnimatePresence mode="wait">
                  {selectedRoles.length > 0 && Object.keys(randomHeroes).length > 0 ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <ScrollArea className="max-h-[320px] pr-4">
                        <div className="space-y-3 pb-2">
                          {selectedRoles.map((role) => (
                            randomHeroes[role] ? (
                              <motion.div
                                key={`${role}-${randomHeroes[role]?.id || 'empty'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-card border rounded-lg overflow-hidden"
                              >
                                <div className="flex h-20">
                                  <div className={`w-1 ${getPositionColor(role).split(' ')[0]}`} />
                                  <div className="relative flex-1 flex items-center">
                                    <div className="w-20 h-20 relative flex-shrink-0">
                                      {imageErrors[role] ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      ) : (
                                        <Image
                                          src={randomHeroes[role].img || "/placeholder.svg"}
                                          alt={randomHeroes[role].localized_name}
                                          fill
                                          className="object-cover"
                                          unoptimized
                                          onError={() => handleMultiImageError(role)}
                                        />
                                      )}
                                    </div>
                                    <div className="p-4 flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge className={getPositionColor(role)}>
                                          {getPositionLabel(role)}
                                        </Badge>
                                      </div>
                                      <h3 className="font-bold mt-1">{randomHeroes[role].localized_name}</h3>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ) : null
                          ))}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  ) : selectedRoles.length > 0 ? (
                    <motion.div
                      key="empty-selection"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-6 border rounded-lg flex flex-col items-center justify-center"
                    >
                      <Shuffle className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Click randomize to pick heroes for your selected positions
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-selection"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-6 border rounded-lg flex flex-col items-center justify-center"
                    >
                      <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Select at least one position to randomize
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
