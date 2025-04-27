"use client"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { fetchHeroes } from "@/lib/api"
import type { Hero, Role } from "@/lib/types"
import { useLineupStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter, Plus, AlertCircle, X } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Debounce function to delay filtering while user types
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized Hero Card component to prevent unnecessary re-renders
const HeroCard = memo(({ 
  hero, 
  isHeroInRole, 
  getHeroRoles, 
  imageLoadError, 
  handleImageError, 
  getAttributeColor, 
  getAttributeLabel, 
  editMode, 
  handleToggleHeroInRole 
}: {
  hero: Hero;
  isHeroInRole: (heroId: number, role: Role) => boolean;
  getHeroRoles: (heroId: number) => Role[];
  imageLoadError: Record<number, boolean>;
  handleImageError: (heroId: number) => void;
  getAttributeColor: (attr: string) => string;
  getAttributeLabel: (attr: string) => string;
  editMode: boolean;
  handleToggleHeroInRole: (hero: Hero, role: Role) => void;
}) => {
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
              src={hero.img ?? "/placeholder.svg"}
              alt={hero.localized_name}
              fill
              className={`object-cover ${isAssigned ? 'opacity-90' : ''}`}
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              onError={() => handleImageError(hero.id)}
            />
            {isAssigned && (
              <div className="absolute top-1 left-1 flex gap-1">
                {assignedRoles.map(role => {
                  let roleColor = "";
                  let positionLabel = "";
                  let tooltipText = "";
                  
                  // Definindo cor, nome e tooltip para cada posição
                  switch (role) {
                    case "HC": 
                      positionLabel = "HC";
                      roleColor = "bg-green-500"; // Safe lane carry (verde)
                      tooltipText = "Hard Carry (Position 1) - Safe Lane";
                      break;
                    case "Mid": 
                      positionLabel = "MID";
                      roleColor = "bg-blue-500"; // Mid lane (azul)
                      tooltipText = "Mid Lane (Position 2)";
                      break;
                    case "Offlane": 
                      positionLabel = "OFF";
                      roleColor = "bg-orange-500"; // Off lane (laranja)
                      tooltipText = "Offlane (Position 3)";
                      break;
                    case "Support 4": 
                      positionLabel = "S4";
                      roleColor = "bg-yellow-500"; // Roaming support (amarelo)
                      tooltipText = "Support 4 (Roaming/Soft Support)";
                      break;
                    case "Support 5": 
                      positionLabel = "S5";
                      roleColor = "bg-pink-500"; // Hard support (rosa)
                      tooltipText = "Support 5 (Hard Support)";
                      break;
                  }
                  
                  return (
                    <TooltipProvider key={role}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`${roleColor} w-6 h-6 rounded-full flex items-center justify-center shadow-md cursor-default select-none`}
                          >
                            <span className="text-xs font-bold text-white">
                              {positionLabel}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="font-medium bg-popover/95 backdrop-blur-sm">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-full ${roleColor}`}></div>
                            <span>{tooltipText}</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
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
      
      {/* Seção para mostrar as roles do herói da API */}
      <div className="p-2 pt-1 bg-accent/30">
        <div className="flex flex-wrap gap-1 justify-center">
          {hero.roles.map((role) => (
            <Badge key={role} variant="secondary" className="text-xs py-0 h-5 select-none cursor-default">
              {role}
            </Badge>
          ))}
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
                <span className="text-xs font-bold">HC ✓</span>
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
                <span className="text-xs font-bold">Mid ✓</span>
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
                <span className="text-xs font-bold">Off ✓</span>
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
                <span className="text-xs font-bold">Sup 4 ✓</span>
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
                <span className="text-xs font-bold">Sup 5 ✓</span>
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
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to optimize re-renders
  return (
    prevProps.hero.id === nextProps.hero.id &&
    prevProps.editMode === nextProps.editMode &&
    prevProps.imageLoadError[prevProps.hero.id] === nextProps.imageLoadError[nextProps.hero.id] &&
    // Check if the hero's role assignments have changed
    JSON.stringify(prevProps.getHeroRoles(prevProps.hero.id)) === 
    JSON.stringify(nextProps.getHeroRoles(nextProps.hero.id))
  );
});

export function HeroList() {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [filteredHeroes, setFilteredHeroes] = useState<Hero[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [attributeFilter, setAttributeFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [imageLoadError, setImageLoadError] = useState<Record<number, boolean>>({})
  
  // Estado para armazenar roles únicos da API
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  
  // Estado para o filtro de posições selecionadas
  const [selectedPositionFilter, setSelectedPositionFilter] = useState<"all" | Role>("all")
  
  // State for autocomplete functionality
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [autocompleteResults, setAutocompleteResults] = useState<Hero[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)

  // Apply debouncing to search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  // Function to get positions that have heroes assigned
  const getActivePositions = useCallback((): Role[] => {
    const positions: Role[] = [];
    
    if (lineup.HC.length > 0) positions.push("HC");
    if (lineup.Mid.length > 0) positions.push("Mid");
    if (lineup.Offlane.length > 0) positions.push("Offlane");
    if (lineup["Support 4"].length > 0) positions.push("Support 4");
    if (lineup["Support 5"].length > 0) positions.push("Support 5");
    
    return positions;
  }, [lineup]);

  // Function to handle toggling heroes in roles
  const handleToggleHeroInRole = useCallback((hero: Hero, role: Role) => {
    if (isHeroInRole(hero.id, role)) {
      removeHero(role, hero.id);
    } else {
      addHero(role, hero);
    }
  }, [isHeroInRole, removeHero, addHero]);

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
      
      // Extrair e definir roles únicos disponíveis na API
      const uniqueRoles = Array.from(
        new Set(data.flatMap(hero => hero.roles))
      ).sort();
      
      setAvailableRoles(uniqueRoles);
      setHeroes(data)
      setFilteredHeroes(data)
      setLoading(false)
    }

    loadHeroes()
  }, [])

  // Create memoized role mapping
  const roleMapping = useMemo(() => ({
    carry: ["carry", "pos 1", "position 1", "hard carry", "safe lane"],
    mid: ["mid", "midlane", "middle", "pos 2", "position 2"],
    offlane: ["offlane", "off lane", "pos 3", "position 3"],
    support: ["support", "pos 4", "pos 5", "position 4", "position 5", "hard support", "soft support"],
  }), []);

  // Use debounced search query for filtering
  useEffect(() => {
    // Create a new search index or filtering function
    const filterHeroes = () => {
      // Start with all heroes
      let result = [...heroes];

      // Filter by search query
      if (debouncedSearchQuery) {
        const lowercaseQuery = debouncedSearchQuery.toLowerCase().trim();
        // Filtrar heróis que contêm a string de busca
        result = result.filter((hero) => 
          hero.localized_name.toLowerCase().includes(lowercaseQuery)
        );
        
        // Ordenar para que os heróis que começam com a string de busca apareçam primeiro
        result.sort((a, b) => {
          const aName = a.localized_name.toLowerCase();
          const bName = b.localized_name.toLowerCase();
          
          // Heróis que começam com a string de busca têm prioridade
          const aStartsWith = aName.startsWith(lowercaseQuery);
          const bStartsWith = bName.startsWith(lowercaseQuery);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Se ambos começam ou ambos não começam, ordenar por ordem alfabética
          return aName.localeCompare(bName);
        });
      }

      // Filter by tab/attribute
      if (activeTab !== "all") {
        if (activeTab === "universal") {
          // Filtrar heróis universais
          result = result.filter((hero) => hero.primary_attr === "all" || hero.primary_attr === "universal");
        } else {
          // Filtrar heróis com atributos tradicionais (str, agi, int)
          result = result.filter((hero) => hero.primary_attr === activeTab);
        }
      }

      // Filter by role - agora usando exatamente o role da API
      if (roleFilter !== "all") {
        // Filtrar direto pelo valor do role selecionado
        result = result.filter((hero) =>
          hero.roles.includes(roleFilter)
        );
      }

      // Novo filtro por posição
      if (selectedPositionFilter !== "all") {
        result = result.filter(hero => {
          const roles = getHeroRoles(hero.id);
          return roles.includes(selectedPositionFilter);
        });
      }

      setFilteredHeroes(result);
    };

    filterHeroes();
  }, [heroes, debouncedSearchQuery, attributeFilter, roleFilter, activeTab, selectedPositionFilter, getHeroRoles]);

  // Efeito para atualizar automaticamente o filtro de posição quando uma posição ficar vazia
  useEffect(() => {
    // Não fazer nada se o filtro atual for "all"
    if (selectedPositionFilter === "all") return;
    
    // Verificar se a posição atual selecionada ainda tem heróis
    const currentPositionHasHeroes = lineup[selectedPositionFilter].length > 0;
    
    if (!currentPositionHasHeroes) {
      // Se a posição atual não tem mais heróis, encontrar a próxima posição com heróis
      const activePositions = getActivePositions();
      
      if (activePositions.length > 0) {
        // Se houver outras posições com heróis, mudar para a primeira delas
        setSelectedPositionFilter(activePositions[0]);
      } else {
        // Se não houver posições com heróis, voltar para "all"
        setSelectedPositionFilter("all");
      }
    }
  }, [lineup, selectedPositionFilter, getActivePositions]);

  const getAttributeLabel = useCallback((attr: string) => {
    switch (attr) {
      case "str": return "Strength";
      case "agi": return "Agility";
      case "int": return "Intelligence";
      default: return "Unknown";
    }
  }, []);

  const getAttributeColor = useCallback((attr: string) => {
    switch (attr) {
      case "str": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "agi": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "int": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  }, []);

  const handleImageError = useCallback((heroId: number) => {
    console.error(
      `Failed to load image for hero ID: ${heroId}`,
      heroes.find((h) => h.id === heroId),
    )
    setImageLoadError((prev) => ({ ...prev, [heroId]: true }))
  }, [heroes]);

  // Function to update autocomplete suggestions based on search query
  const updateAutocompleteSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      // Quando limpar a busca, mostrar todos os heróis em ordem alfabética
      const sortedHeroes = [...heroes].sort((a, b) => 
        a.localized_name.toLowerCase().localeCompare(b.localized_name.toLowerCase())
      );
      setAutocompleteResults(sortedHeroes);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const suggestions = heroes
      .filter(hero => hero.localized_name.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        // Sort by how closely the hero name matches the query
        // Exact matches at beginning come first
        const aName = a.localized_name.toLowerCase();
        const bName = b.localized_name.toLowerCase();
        
        // Exact starts-with matches get highest priority
        const aStartsWith = aName.startsWith(normalizedQuery);
        const bStartsWith = bName.startsWith(normalizedQuery);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then sort alphabetically
        return aName.localeCompare(bName);
      });
    
    setAutocompleteResults(suggestions);
  }, [heroes]);
  
  // Handle clearing the search input
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setAutocompleteResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Handle selecting a hero from autocomplete
  const handleSelectHero = useCallback((hero: Hero) => {
    setSearchQuery(hero.localized_name);
    setIsAutocompleteOpen(false);
    setAutocompleteResults([]);
  }, []);

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isAutocompleteOpen || autocompleteResults.length === 0) return;

    // Down arrow - move selection down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < autocompleteResults.length - 1 ? prev + 1 : 0
      );
    } 
    // Up arrow - move selection up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : autocompleteResults.length - 1
      );
    } 
    // Enter - select the highlighted item
    else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectHero(autocompleteResults[selectedSuggestionIndex]);
    }
    // Escape - close the autocomplete
    else if (e.key === "Escape") {
      e.preventDefault();
      setIsAutocompleteOpen(false);
    }
  }, [isAutocompleteOpen, autocompleteResults, selectedSuggestionIndex, handleSelectHero]);

  // Reset selection index when autocomplete results change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [autocompleteResults]);

  // Handle search input changes
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    updateAutocompleteSuggestions(query);
    // Sempre manter o dropdown aberto, independente de ter texto ou não
    setIsAutocompleteOpen(true);
  }, [updateAutocompleteSuggestions]);
  
  // Focus and show autocomplete when input is focused
  const handleInputFocus = useCallback(() => {
    // Se já tiver um texto de busca, mostra sugestões relacionadas
    if (searchQuery) {
      updateAutocompleteSuggestions(searchQuery);
    } else {
      // Mostrar todos os heróis quando o input recebe foco e não tem texto
      // Ordenar por ordem alfabética para facilitar a navegação
      const sortedHeroes = [...heroes].sort((a, b) => 
        a.localized_name.toLowerCase().localeCompare(b.localized_name.toLowerCase())
      );
      setAutocompleteResults(sortedHeroes);
    }
    setIsAutocompleteOpen(true);
  }, [searchQuery, heroes, updateAutocompleteSuggestions]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setIsAutocompleteOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Memoize props passed to each hero card to prevent unnecessary re-renders
  // This needs to be outside any conditionals to maintain consistent hook order
  const heroCardProps = useMemo(() => ({
    isHeroInRole,
    getHeroRoles,
    imageLoadError,
    handleImageError,
    getAttributeColor,
    getAttributeLabel,
    editMode,
    handleToggleHeroInRole
  }), [
    isHeroInRole, 
    getHeroRoles, 
    imageLoadError, 
    handleImageError,
    getAttributeColor,
    getAttributeLabel,
    editMode,
    handleToggleHeroInRole
  ]);

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
                className="pl-10 pr-8"
                value={searchQuery}
                onChange={handleSearchInputChange}
                ref={searchInputRef}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-3"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              )}
              {isAutocompleteOpen && autocompleteResults.length > 0 && (
                <div 
                  ref={autocompleteRef}
                  className="absolute z-10 w-full bg-background border border-input rounded-md mt-1 shadow-md overflow-auto"
                  style={{ maxHeight: "calc(2 * 28px)" }} // Altura para mostrar exatamente 2 itens
                >
                  {autocompleteResults.map((hero, index) => (
                    <div
                      key={hero.id}
                      className={`flex w-full items-center px-3 py-1 text-sm cursor-pointer hover:bg-accent text-left h-7 ${selectedSuggestionIndex === index ? 'bg-accent' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Impede que o input perca o foco
                        handleSelectHero(hero);
                      }}
                    >
                      <span>{hero.localized_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Filtro por role da API */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Novo filtro por posição selecionada - mostrando apenas posições com heróis */}
            <Select value={selectedPositionFilter} onValueChange={setSelectedPositionFilter as any}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {/* Mostrar apenas posições que têm heróis selecionados */}
                {getActivePositions().map(position => {
                  // Definindo a cor e o texto para cada posição
                  let positionColor = "";
                  let positionText = "";
                  
                  switch (position) {
                    case "HC":
                      positionColor = "bg-green-500";
                      positionText = "Position 1 (HC)";
                      break;
                    case "Mid":
                      positionColor = "bg-blue-500";
                      positionText = "Position 2 (Mid)";
                      break;
                    case "Offlane":
                      positionColor = "bg-orange-500";
                      positionText = "Position 3 (Offlane)";
                      break;
                    case "Support 4":
                      positionColor = "bg-yellow-500";
                      positionText = "Position 4 (Support)";
                      break;
                    case "Support 5":
                      positionColor = "bg-pink-500";
                      positionText = "Position 5 (Support)";
                      break;
                  }
                  
                  return (
                    <SelectItem key={position} value={position}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${positionColor} mr-2`}></div>
                        <span>{positionText}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-4 overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="str">Strength</TabsTrigger>
              <TabsTrigger value="agi">Agility</TabsTrigger>
              <TabsTrigger value="int">Intelligence</TabsTrigger>
              <TabsTrigger value="universal">Universal</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredHeroes.map((hero) => (
              <HeroCard 
                key={hero.id} 
                hero={hero} 
                {...heroCardProps}
              />
            ))}
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
