"use client"

import { useState, useEffect } from "react"
import { fetchHeroes } from "@/lib/api"
import type { Hero, Role } from "@/lib/types"
import { useLineupStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroList() {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [filteredHeroes, setFilteredHeroes] = useState<Hero[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [attributeFilter, setAttributeFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const { addHero, editMode } = useLineupStore()

  useEffect(() => {
    const loadHeroes = async () => {
      setLoading(true)
      const data = await fetchHeroes()
      setHeroes(data)
      setFilteredHeroes(data)
      setLoading(false)
    }

    loadHeroes()
  }, [])

  useEffect(() => {
    let result = heroes

    // Filter by search query
    if (searchQuery) {
      result = result.filter((hero) => hero.localized_name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by attribute
    if (attributeFilter !== "all") {
      result = result.filter((hero) => hero.primary_attr === attributeFilter)
    }

    // Filter by role
    if (roleFilter !== "all") {
      result = result.filter((hero) => hero.roles.some((role) => role.toLowerCase() === roleFilter.toLowerCase()))
    }

    setFilteredHeroes(result)
  }, [heroes, searchQuery, attributeFilter, roleFilter])

  const handleAddToRole = (hero: Hero, role: Role) => {
    addHero(role, hero)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(15)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-md" />
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search heroes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={attributeFilter} onValueChange={setAttributeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Attribute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attributes</SelectItem>
                <SelectItem value="str">Strength</SelectItem>
                <SelectItem value="agi">Agility</SelectItem>
                <SelectItem value="int">Intelligence</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="carry">Carry</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="offlane">Offlane</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredHeroes.map((hero) => (
            <div key={hero.id} className="relative group">
              <Card className="overflow-hidden h-full">
                <div className="relative h-24 bg-gradient-to-b from-transparent to-black/50">
                  <Image
                    src={hero.img || "/placeholder.svg"}
                    alt={hero.localized_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-sm font-medium text-white truncate">{hero.localized_name}</p>
                  </div>
                </div>
                {editMode && (
                  <div className="p-2 grid grid-cols-2 gap-1 text-xs">
                    <Button size="sm" variant="outline" className="h-7" onClick={() => handleAddToRole(hero, "HC")}>
                      HC
                    </Button>
                    <Button size="sm" variant="outline" className="h-7" onClick={() => handleAddToRole(hero, "Mid")}>
                      Mid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      onClick={() => handleAddToRole(hero, "Offlane")}
                    >
                      Off
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      onClick={() => handleAddToRole(hero, "Support 4")}
                    >
                      Sup 4
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 col-span-2"
                      onClick={() => handleAddToRole(hero, "Support 5")}
                    >
                      Sup 5
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>

        {filteredHeroes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No heroes found matching your filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
