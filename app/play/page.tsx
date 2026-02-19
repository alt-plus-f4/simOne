"use client"

import { GameProvider } from "@/components/game/game-provider"
import { GameFlow } from "@/components/game/game-flow"

export default function PlayPage() {
  return (
    <GameProvider>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <GameFlow />
      </div>
    </GameProvider>
  )
}
