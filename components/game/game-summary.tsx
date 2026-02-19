"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreDisplay } from "./score-display"
import { Badge } from "@/components/ui/badge"
import { Check, X, RotateCcw, Trophy, Music } from "lucide-react"
import Link from "next/link"
import type { GameSong } from "./game-provider"
import { cn } from "@/lib/utils"

interface GameSummaryProps {
  totalPoints: number
  totalCorrect: number
  totalSongs: number
  mode: string
  guessHistory: Array<{
    song: GameSong
    correct: boolean
    attempts: number
    points: number
  }>
  onPlayAgain: () => void
}

export function GameSummary({
  totalPoints,
  totalCorrect,
  totalSongs,
  mode,
  guessHistory,
  onPlayAgain,
}: GameSummaryProps) {
  const accuracy = totalSongs > 0 ? Math.round((totalCorrect / totalSongs) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full max-w-lg border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
            <Trophy className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Game Over!</CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col gap-1">
              <ScoreDisplay points={totalPoints} animate size="lg" />
              <span className="text-xs text-muted-foreground">Total Points</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {totalCorrect}/{totalSongs}
              </span>
              <span className="text-xs text-muted-foreground">Correct</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {accuracy}%
              </span>
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>
          </div>

          {/* Round History */}
          {guessHistory.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">Round History</h3>
              <div className="flex flex-col gap-1.5">
                {guessHistory.map((round, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2"
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        round.correct
                          ? "bg-primary/20 text-primary"
                          : "bg-destructive/20 text-destructive"
                      )}
                    >
                      {round.correct ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{round.song.title}</p>
                      {round.song.artist && (
                        <p className="truncate text-xs text-muted-foreground">
                          {round.song.artist}
                        </p>
                      )}
                    </div>
                    {round.correct && (
                      <Badge variant="secondary" className="text-xs tabular-nums">
                        +{round.points}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {round.attempts} {round.attempts === 1 ? "try" : "tries"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={onPlayAgain} className="flex-1 gap-2">
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
            <Button variant="outline" className="flex-1 gap-2" asChild>
              <Link href="/leaderboard">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
