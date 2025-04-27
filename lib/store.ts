"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Hero, Lineup, LineupState, Role } from "@/lib/types"

const emptyLineup: Lineup = {
  HC: [],
  Mid: [],
  Offlane: [],
  "Support 4": [],
  "Support 5": [],
}

export const useLineupStore = create<LineupState>()(
  persist(
    (set) => ({
      lineup: emptyLineup,
      editMode: true,
      selectedPositions: [],
      addHero: (role: Role, hero: Hero) =>
        set((state) => {
          // Check if hero already exists in this role
          if (state.lineup[role].some((h) => h.id === hero.id)) {
            return state
          }

          return {
            lineup: {
              ...state.lineup,
              [role]: [...state.lineup[role], hero],
            },
          }
        }),
      removeHero: (role: Role, heroId: number) =>
        set((state) => ({
          lineup: {
            ...state.lineup,
            [role]: state.lineup[role].filter((hero) => hero.id !== heroId),
          },
        })),
      toggleEditMode: () =>
        set((state) => ({
          editMode: !state.editMode,
        })),
      clearLineup: () =>
        set(() => ({
          lineup: emptyLineup,
        })),
      importLineup: (importedLineup: Lineup) =>
        set(() => ({
          lineup: importedLineup,
        })),
      togglePositionFilter: (role: Role) =>
        set((state) => {
          if (state.selectedPositions.includes(role)) {
            return {
              selectedPositions: state.selectedPositions.filter(r => r !== role)
            }
          } else {
            return {
              selectedPositions: [...state.selectedPositions, role]
            }
          }
        }),
      clearPositionFilter: () =>
        set(() => ({
          selectedPositions: []
        })),
    }),
    {
      name: "dota-lineup-storage",
    },
  ),
)
