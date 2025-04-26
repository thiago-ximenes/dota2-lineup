export interface Hero {
  id: number
  name: string
  localized_name: string
  primary_attr: string
  attack_type: string
  roles: string[]
  img: string
  icon: string
  base_health: number
  base_mana: number
  base_armor: number
  base_attack_min: number
  base_attack_max: number
  move_speed: number
}

export type Role = "HC" | "Mid" | "Offlane" | "Support 4" | "Support 5"

export interface Lineup {
  HC: Hero[]
  Mid: Hero[]
  Offlane: Hero[]
  "Support 4": Hero[]
  "Support 5": Hero[]
}

export interface LineupState {
  lineup: Lineup
  editMode: boolean
  addHero: (role: Role, hero: Hero) => void
  removeHero: (role: Role, heroId: number) => void
  toggleEditMode: () => void
  clearLineup: () => void
}
