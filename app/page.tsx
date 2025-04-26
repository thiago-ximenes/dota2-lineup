import { HeroList } from "@/components/hero-list"
import { LineupManager } from "@/components/lineup-manager"
import { GameMode } from "@/components/game-mode"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dota 2 Lineup Manager</h1>
          <ModeToggle />
        </header>

        <div className="space-y-6">
          <GameMode />
          <LineupManager />
          <HeroList />
        </div>
      </div>
    </main>
  )
}
