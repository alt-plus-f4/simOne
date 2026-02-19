"use client"

import useSWR from "swr"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RankBadge } from "./rank-badge"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface Player {
  id: string
  name: string | null
  image: string | null
  total_points: number
  games_played: number
  correct_guesses: number
  ranked_rating: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface LeaderboardTableProps {
  sort: string
}

export function LeaderboardTable({ sort }: LeaderboardTableProps) {
  const { data, isLoading, error } = useSWR(
    `/api/leaderboard?sort=${sort}&limit=50`,
    fetcher,
    { revalidateOnFocus: false }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Failed to load leaderboard
      </div>
    )
  }

  const players: Player[] = data?.players || []

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-muted-foreground">No players on the leaderboard yet.</p>
        <p className="text-sm text-muted-foreground">
          Be the first to play and claim the top spot!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Header */}
      <div className="grid grid-cols-[48px_1fr_80px_80px_80px] items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid-cols-[48px_1fr_100px_100px_100px_80px]">
        <span className="text-center">#</span>
        <span>Player</span>
        <span className="text-right">Points</span>
        <span className="hidden text-right md:block">Games</span>
        <span className="text-right">Correct</span>
        <span className="hidden text-right md:block">Rank</span>
      </div>

      {/* Rows */}
      {players.map((player, i) => {
        const position = i + 1
        return (
          <div
            key={player.id}
            className={cn(
              "grid grid-cols-[48px_1fr_80px_80px_80px] items-center gap-2 rounded-lg px-3 py-2.5 transition-colors md:grid-cols-[48px_1fr_100px_100px_100px_80px]",
              position <= 3 ? "bg-secondary/50" : "hover:bg-secondary/30"
            )}
          >
            {/* Position */}
            <span
              className={cn(
                "text-center text-sm font-bold tabular-nums",
                position === 1 && "text-amber-400",
                position === 2 && "text-zinc-300",
                position === 3 && "text-orange-500",
                position > 3 && "text-muted-foreground"
              )}
            >
              {position}
            </span>

            {/* Player */}
            <div className="flex items-center gap-2 overflow-hidden">
              <Avatar className="h-7 w-7">
                <AvatarImage src={player.image ?? undefined} alt={player.name ?? "Player"} />
                <AvatarFallback className="bg-secondary text-xs">
                  {player.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium">
                {player.name || "Anonymous"}
              </span>
            </div>

            {/* Points */}
            <span className="text-right text-sm font-bold tabular-nums text-accent">
              {player.total_points.toLocaleString()}
            </span>

            {/* Games */}
            <span className="hidden text-right text-sm tabular-nums text-muted-foreground md:block">
              {player.games_played}
            </span>

            {/* Correct */}
            <span className="text-right text-sm tabular-nums text-muted-foreground">
              {player.correct_guesses}
            </span>

            {/* Rank Badge */}
            <div className="hidden justify-end md:flex">
              <RankBadge points={player.total_points} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
