"use client"

import { useState } from "react"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Gamepad2, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const sortOptions = [
  { id: "total_points", label: "Points", icon: Star },
  { id: "games_played", label: "Games", icon: Gamepad2 },
  { id: "correct_guesses", label: "Accuracy", icon: Target },
] as const

export default function LeaderboardPage() {
  const [sort, setSort] = useState("total_points")

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
            <Trophy className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              Top players ranked by performance
            </p>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
          {sortOptions.map((opt) => (
            <Button
              key={opt.id}
              variant="ghost"
              size="sm"
              onClick={() => setSort(opt.id)}
              className={cn(
                "flex-1 gap-1.5 text-xs",
                sort === opt.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <LeaderboardTable sort={sort} />
    </div>
  )
}
