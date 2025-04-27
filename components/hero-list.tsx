"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchHeroes } from "@/lib/api"
import type { Hero, Role } from "@/lib/types"
import { useLineupStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter, Plus, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HeroList() {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [filteredHeroes, setFilteredHeroes] = useState<Hero[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [attributeFilter, setAttributeFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [imageLoadError, setImageLoadError] = useState<Record<number, boolean>>({})

  // Call useLineupStore at the top level of the component
  const { addHero, removeHero, editMode, lineup } = useLineupStore()

  // Function to check if a hero is assigned to a specific role
  const isHeroInRole = useCallback((heroId: number, role: Role) => {
    return lineup[role].some(h => h.id === heroId);
  }, [lineup]);

  // Function to get all roles a hero is assigned to
  const getHeroRoles = useCallback((heroId: number): Role[] => {
    const roles: Role[] = [];
    
    if (isHeroInRole(heroId, "HC")) roles.push("HC");
    if (isHeroInRole(heroId, "Mid")) roles.push("Mid");
    if (isHeroInRole(heroId, "Offlane")) roles.push("Offlane");
    if (isHeroInRole(heroId, "Support 4")) roles.push("Support 4");
    if (isHeroInRole(heroId, "Support 5")) roles.push("Support 5");
    
    return roles;
  }, [isHeroInRole]);

  // Function to handle toggling heroes in roles
  const handleToggleHeroInRole = (hero: Hero, role: Role) => {
    if (isHeroInRole(hero.id, role)) {
      removeHero(role, hero.id);
    } else {
      addHero(role, hero);
    }
  };

  useEffect(() => {
    const loadHeroes = async () => {
      setLoading(true)
      const data = await fetchHeroes()

      // Log the first hero to debug image paths
      if (data.length > 0) {
        console.log("First hero data after processing:", {
          id: data[0].id,
          name: data[0].localized_name,
          img: data[0].img,
          icon: data[0].icon,
        })
      }

      setHeroes(data)
      setFilteredHeroes(data)
      setLoading(false)
    }

    loadHeroes()
  }, [])

  const filterHeroes = useCallback(() => {
    let result = heroes

    // Filter by search query
    if (searchQuery) {
      result = result.filter((hero) => hero.localized_name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by attribute
    if (attributeFilter !== "all") {
      result = result.filter((hero) => hero.primary_attr === attributeFilter)
    }

    // Filter by role - Fix for midlane filter
    if (roleFilter !== "all") {
      // Map the filter value to possible role names in the API
      const roleMapping: Record<string, string[]> = {
        carry: ["carry", "pos 1", "position 1", "hard carry", "safe lane"],
        mid: ["mid", "midlane", "middle", "pos 2", "position 2"],
        offlane: ["offlane", "off lane", "pos 3", "position 3"],
        support: ["support", "pos 4", "pos 5", "position 4", "position 5", "hard support", "soft support"],
      }

      const possibleRoles = roleMapping[roleFilter] || [roleFilter]

      result = result.filter((hero) =>
        hero.roles.some((role) =>
          possibleRoles.some((mappedRole) => role.toLowerCase().includes(mappedRole.toLowerCase())),
        ),
      )
    }

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((hero) => hero.primary_attr === activeTab)
    }

    setFilteredHeroes(result)
  }, [heroes, searchQuery, attributeFilter, roleFilter, activeTab])

  useEffect(() => {
    filterHeroes()
  }, [filterHeroes])

  const getAttributeLabel = (attr: string) => {
    switch (attr) {
      case "str":
        return "Strength"
      case "agi":
        return "Agility"
      case "int":
        return "Intelligence"
      default:
        return "Unknown"
    }
  }

  const getAttributeColor = (attr: string) => {
    switch (attr) {
      case "str":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "agi":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "int":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const handleImageError = (heroId: number) => {
    console.error(
      `Failed to load image for hero ID: ${heroId}`,
      heroes.find((h) => h.id === heroId),
    )
    setImageLoadError((prev) => ({ ...prev, [heroId]: true }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hero Selection</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-md" />
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Selection</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search heroes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="carry">Carry</SelectItem>
                <SelectItem value="mid">Midlane</SelectItem>
                <SelectItem value="offlane">Offlane</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-4 overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="str">Strength</TabsTrigger>
              <TabsTrigger value="agi">Agility</TabsTrigger>
              <TabsTrigger value="int">Intelligence</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredHeroes.map((hero) => {
              // Use the helper function instead of calling useLineupStore in the loop
              const assignedRoles = getHeroRoles(hero.id);
              const isAssigned = assignedRoles.length > 0;
              
              return (
                <Card
                  key={hero.id}
                  className={`overflow-hidden h-full group hover:ring-2 hover:ring-primary/50 transition-all ${isAssigned ? 'ring-1 ring-primary/70' : ''}`}
                >
                  <div className="relative h-28 sm:h-32 bg-gradient-to-b from-transparent to-black/70">
                    {imageLoadError[hero.id] ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mb-1" />
                        <p className="text-xs text-center text-muted-foreground px-2">{hero.localized_name}</p>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={hero.img || "/placeholder.svg"}
                          alt={hero.localized_name}
                          fill
                          className={`object-cover ${isAssigned ? 'opacity-90' : ''}`}
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                          onError={() => handleImageError(hero.id)}
                        />
                        {isAssigned && (
                          <div className="absolute top-0 left-0 px-1.5 py-1 bg-primary/90 flex gap-1">
                            {assignedRoles.map(role => {
                              let roleLabel = ""
                              switch (role) {
                                case "HC": roleLabel = "1"; break;
                                case "Mid": roleLabel = "2"; break;
                                case "Offlane": roleLabel = "3"; break;
                                case "Support 4": roleLabel = "4"; break;
                                case "Support 5": roleLabel = "5"; break;
                              }
                              return (
                                <span key={role} className="text-xs font-bold text-primary-foreground">
                                  {roleLabel}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className={`${getAttributeColor(hero.primary_attr)}`}>
                        {getAttributeLabel(hero.primary_attr).charAt(0)}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-sm font-medium text-white truncate">{hero.localized_name}</p>
                    </div>
                  </div>
                  {editMode && (
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {/* Left column - Core roles */}
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant={isHeroInRole(hero.id, "HC") ? "default" : "outline"}
                          className={`w-full h-8 flex items-center justify-center ${isHeroInRole(hero.id, "HC") ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => handleToggleHeroInRole(hero, "HC")}
                        >
                          {isHeroInRole(hero.id, "HC") ? (
                            <>
                              <span className="text-xs font-bold">HC ✓</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              HC
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={isHeroInRole(hero.id, "Mid") ? "default" : "outline"}
                          className={`w-full h-8 flex items-center justify-center ${isHeroInRole(hero.id, "Mid") ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => handleToggleHeroInRole(hero, "Mid")}
                        >
                          {isHeroInRole(hero.id, "Mid") ? (
                            <>
                              <span className="text-xs font-bold">Mid ✓</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Mid
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={isHeroInRole(hero.id, "Offlane") ? "default" : "outline"}
                          className={`w-full h-8 flex items-center justify-center ${isHeroInRole(hero.id, "Offlane") ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => handleToggleHeroInRole(hero, "Offlane")}
                        >
                          {isHeroInRole(hero.id, "Offlane") ? (
                            <>
                              <span className="text-xs font-bold">Off ✓</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Off
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Right column - Support roles */}
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant={isHeroInRole(hero.id, "Support 4") ? "default" : "outline"}
                          className={`w-full h-8 flex items-center justify-center ${isHeroInRole(hero.id, "Support 4") ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => handleToggleHeroInRole(hero, "Support 4")}
                        >
                          {isHeroInRole(hero.id, "Support 4") ? (
                            <>
                              <span className="text-xs font-bold">Sup 4 ✓</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Sup 4
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={isHeroInRole(hero.id, "Support 5") ? "default" : "outline"}
                          className={`w-full h-8 flex items-center justify-center ${isHeroInRole(hero.id, "Support 5") ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => handleToggleHeroInRole(hero, "Support 5")}
                        >
                          {isHeroInRole(hero.id, "Support 5") ? (
                            <>
                              <span className="text-xs font-bold">Sup 5 ✓</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Sup 5
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No heroes found matching your filters.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("")
                  setAttributeFilter("all")
                  setRoleFilter("all")
                  setActiveTab("all")
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
