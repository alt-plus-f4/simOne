"use client"

import { useState, useCallback, useEffect } from "react"
import { useGame, type GameSong } from "./game-provider"
import { ModeSelector } from "./mode-selector"
import { SongSearch, type SongResult } from "./song-search"
import { AudioPlayer } from "./audio-player"
import { VideoPlayer } from "./video-player"
import { LyricsDisplay } from "./lyrics-display"
import { GuessInput } from "./guess-input"
import { GuessFeedback } from "./guess-feedback"
import { AttemptTracker } from "./attempt-tracker"
import { ScoreDisplay } from "./score-display"
import { GameSummary } from "./game-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Play, X, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getSecondsForAttempt } from "@/lib/scoring"
import { cn } from "@/lib/utils"

export function GameFlow() {
  const { state, currentSong, setMode, startSession, submitGuess, skipSong, nextSong, finishGame, reset } = useGame()
  const [selectedSongs, setSelectedSongs] = useState<GameSong[]>([])
  const [feedbackType, setFeedbackType] = useState<"correct" | "wrong" | null>(null)
  const [lyricsLines, setLyricsLines] = useState<string[]>([])
  const [loadingLyrics, setLoadingLyrics] = useState(false)

  // Fetch lyrics when mode is lyrics and song changes
  useEffect(() => {
    if (state.mode === "lyrics" && currentSong && state.status === "playing") {
      setLoadingLyrics(true)
      const searchQ = `${currentSong.title} ${currentSong.artist || ""}`.trim()
      fetch(`/api/lyrics?q=${encodeURIComponent(searchQ)}`)
        .then((r) => r.json())
        .then((data) => {
          setLyricsLines(data.lines || [])
        })
        .catch(() => setLyricsLines([]))
        .finally(() => setLoadingLyrics(false))
    }
  }, [state.mode, currentSong, state.status])

  const handleAddSong = useCallback(
    (song: SongResult) => {
      if (selectedSongs.some((s) => s.youtube_id === song.youtube_id)) {
        toast.error("Song already added")
        return
      }
      if (selectedSongs.length >= 10) {
        toast.error("Maximum 10 songs per session")
        return
      }
      setSelectedSongs((prev) => [...prev, song as GameSong])
      toast.success(`Added "${song.title}"`)
    },
    [selectedSongs]
  )

  const handleRemoveSong = (youtubeId: string) => {
    setSelectedSongs((prev) => prev.filter((s) => s.youtube_id !== youtubeId))
  }

  const handleStartGame = async () => {
    if (selectedSongs.length === 0) {
      toast.error("Add at least one song to play")
      return
    }
    await startSession(selectedSongs)
  }

  const handleGuess = async (guess: string) => {
    setFeedbackType(null)
    const correct = await submitGuess(guess)
    setFeedbackType(correct ? "correct" : "wrong")

    if (!correct) {
      // Clear feedback after a moment for wrong guesses
      setTimeout(() => setFeedbackType(null), 1500)
    }
  }

  const handleNextSong = () => {
    setFeedbackType(null)
    setLyricsLines([])
    nextSong()
  }

  const handleFinish = async () => {
    await finishGame()
  }

  const handlePlayAgain = () => {
    setSelectedSongs([])
    setFeedbackType(null)
    setLyricsLines([])
    reset()
  }

  // Calculate lyrics reveal based on attempt number
  const revealedLyricsLines = Math.min(
    state.attemptNumber * 2,
    lyricsLines.length
  )

  // Step 1: Mode Selection
  if (state.status === "idle") {
    return <ModeSelector onSelect={setMode} />
  }

  // Step 2: Song Selection
  if (state.status === "selecting") {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <Badge variant="secondary" className="mb-3 capitalize">
            {state.mode} Mode
          </Badge>
          <h1 className="text-2xl font-bold">Add Songs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste YouTube URLs or search to add songs. You can add up to 10 songs per game.
          </p>
        </div>

        <SongSearch onSelect={handleAddSong} />

        {/* Selected songs */}
        {selectedSongs.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>
                  Songs to Play ({selectedSongs.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {selectedSongs.map((song, i) => (
                  <div
                    key={song.youtube_id}
                    className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2"
                  >
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    {song.thumbnail_url ? (
                      <img
                        src={song.thumbnail_url}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                        <Music className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{song.title}</p>
                      {song.artist && (
                        <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSong(song.youtube_id)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${song.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePlayAgain}>
            Back
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleStartGame}
            disabled={selectedSongs.length === 0}
          >
            <Play className="h-4 w-4" />
            Start Game ({selectedSongs.length} {selectedSongs.length === 1 ? "song" : "songs"})
          </Button>
        </div>
      </div>
    )
  }

  // Step 3: Game Over
  if (state.status === "finished") {
    return (
      <GameSummary
        totalPoints={state.totalPoints}
        totalCorrect={state.totalCorrect}
        totalSongs={state.songs.length}
        mode={state.mode}
        guessHistory={state.guessHistory}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // Step 4: Active Game
  const songNumber = state.currentSongIndex + 1
  const totalSongs = state.songs.length
  const isRoundOver = state.status === "correct" || state.status === "skipped"
  const isLastSong = state.currentSongIndex >= state.songs.length - 1

  return (
    <div className="flex flex-col gap-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            {state.mode}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Song {songNumber} of {totalSongs}
          </span>
        </div>
        <ScoreDisplay points={state.totalPoints} />
      </div>

      {/* Song Progress Bar */}
      <div className="flex items-center gap-1">
        {state.songs.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i < state.currentSongIndex
                ? state.guessHistory[i]?.correct
                  ? "bg-primary"
                  : "bg-destructive/60"
                : i === state.currentSongIndex
                  ? "bg-foreground"
                  : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Player Area */}
      {currentSong && (
        <div className="flex flex-col items-center gap-4">
          {state.mode === "audio" && !isRoundOver && (
            <AudioPlayer
              videoId={currentSong.youtube_id}
              maxSeconds={getSecondsForAttempt(state.attemptNumber)}
              autoPlay
            />
          )}

          {state.mode === "video" && !isRoundOver && (
            <VideoPlayer
              videoId={currentSong.youtube_id}
              maxSeconds={getSecondsForAttempt(state.attemptNumber)}
              autoPlay
            />
          )}

          {state.mode === "lyrics" && !isRoundOver && (
            loadingLyrics ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading lyrics...
              </div>
            ) : (
              <LyricsDisplay
                lyrics={lyricsLines}
                revealedLines={revealedLyricsLines}
              />
            )
          )}
        </div>
      )}

      {/* Attempt Tracker */}
      {!isRoundOver && (
        <div className="flex justify-center">
          <AttemptTracker current={state.attemptNumber} />
        </div>
      )}

      {/* Feedback */}
      {feedbackType === "wrong" && state.status === "guessing" && (
        <GuessFeedback type="wrong" />
      )}

      {state.status === "correct" && currentSong && (
        <GuessFeedback
          type="correct"
          songTitle={currentSong.title}
          artist={currentSong.artist}
          points={state.lastGuessPoints ?? 0}
        />
      )}

      {state.status === "skipped" && currentSong && (
        <GuessFeedback
          type="skipped"
          songTitle={currentSong.title}
          artist={currentSong.artist}
        />
      )}

      {/* Guess Input */}
      {!isRoundOver && (
        <GuessInput
          onSubmit={handleGuess}
          onSkip={skipSong}
          attempt={state.attemptNumber}
          disabled={state.status !== "playing" && state.status !== "guessing"}
        />
      )}

      {/* Round Over Actions */}
      {isRoundOver && (
        <div className="flex items-center justify-center gap-3">
          {isLastSong ? (
            <Button onClick={handleFinish} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              See Results
            </Button>
          ) : (
            <Button onClick={handleNextSong} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Next Song
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
