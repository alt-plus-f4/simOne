"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RankBadge } from "@/components/leaderboard/rank-badge"
import { Button } from "@/components/ui/button"
import {
  Star,
  Gamepad2,
  Target,
  Hash,
  Loader2,
  Headphones,
  Video,
  FileText,
  Clock,
} from "lucide-react"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession()
  const { data, isLoading, error } = useSWR(
    session ? "/api/profile" : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-xl font-bold">Sign in to view your profile</h2>
        <p className="text-muted-foreground">Track your progress, stats, and match history.</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  if (error || !data?.user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Failed to load profile
      </div>
    )
  }

  const { user, recentGames, rank } = data
  const accuracy =
    user.games_played > 0
      ? Math.round((user.correct_guesses / Math.max(user.games_played, 1)) * 100)
      : 0

  const modeIcon = (mode: string) => {
    switch (mode) {
      case "audio": return <Headphones className="h-3.5 w-3.5" />
      case "video": return <Video className="h-3.5 w-3.5" />
      case "lyrics": return <FileText className="h-3.5 w-3.5" />
      default: return <Gamepad2 className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
          <AvatarFallback className="bg-primary/20 text-xl text-primary">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
            <RankBadge points={user.total_points} size="md" />
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {rank > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Global Rank: #{rank}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Star className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold tabular-nums">{user.total_points.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">Total Points</span>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold tabular-nums">{user.games_played}</span>
            <span className="text-xs text-muted-foreground">Games Played</span>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Target className="h-5 w-5 text-chart-3" />
            <span className="text-2xl font-bold tabular-nums">{user.correct_guesses}</span>
            <span className="text-xs text-muted-foreground">Correct Guesses</span>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Hash className="h-5 w-5 text-chart-4" />
            <span className="text-2xl font-bold tabular-nums">{accuracy}%</span>
            <span className="text-xs text-muted-foreground">Accuracy</span>
          </CardContent>
        </Card>
      </div>

      {/* Match History */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentGames && recentGames.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentGames.map((game: {
                id: string
                mode: string
                total_songs: number
                correct_guesses: number
                total_points: number
                completed_at: string
              }) => {
                const gameAccuracy =
                  game.total_songs > 0
                    ? Math.round((game.correct_guesses / game.total_songs) * 100)
                    : 0
                return (
                  <div
                    key={game.id}
                    className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      {modeIcon(game.mode)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {game.mode}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {game.correct_guesses}/{game.total_songs} correct
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold tabular-nums text-accent">
                        +{game.total_points}
                      </span>
                      <p className="text-xs text-muted-foreground">{gameAccuracy}%</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {game.completed_at
                        ? new Date(game.completed_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No games played yet.</p>
              <Button className="mt-3" size="sm" asChild>
                <Link href="/play">Play Your First Game</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
