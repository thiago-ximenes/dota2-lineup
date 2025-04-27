import { HeroList } from "@/components/hero-list"
import { LineupManager } from "@/components/lineup-manager"
import { GameMode } from "@/components/game-mode"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Dota 2 Lineup Manager</h1>
          <ModeToggle />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GameMode />
          <LineupManager />
        </div>

        <HeroList />
      </div>
    </main>
  )
}
