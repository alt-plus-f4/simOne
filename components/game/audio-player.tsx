"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface AudioPlayerProps {
  videoId: string
  maxSeconds: number
  onSnippetEnd?: () => void
  autoPlay?: boolean
}

export function AudioPlayer({ videoId, maxSeconds, onSnippetEnd, autoPlay = false }: AudioPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  useEffect(() => {
    // Reset when maxSeconds changes (new attempt)
    setProgress(0)
    setIsPlaying(false)
    clearTimers()
  }, [maxSeconds, clearTimers])

  const playSnippet = useCallback(() => {
    if (!playerRef.current) return
    clearTimers()
    playerRef.current.seekTo(0, true)
    playerRef.current.playVideo()
    setIsPlaying(true)
    setProgress(0)

    const startTime = Date.now()
    progressInterval.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      setProgress(Math.min(elapsed / maxSeconds, 1))
    }, 50)

    timerRef.current = setTimeout(() => {
      playerRef.current?.pauseVideo()
      setIsPlaying(false)
      setProgress(1)
      clearTimers()
      onSnippetEnd?.()
    }, maxSeconds * 1000)
  }, [maxSeconds, onSnippetEnd, clearTimers])

  const pauseSnippet = useCallback(() => {
    playerRef.current?.pauseVideo()
    setIsPlaying(false)
    clearTimers()
  }, [clearTimers])

  const onReady = useCallback(
    (event: YouTubeEvent) => {
      playerRef.current = event.target
      event.target.setVolume(80)
      if (autoPlay) {
        setTimeout(() => playSnippet(), 500)
      }
    },
    [autoPlay, playSnippet]
  )

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden YouTube player for audio-only */}
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
        <YouTube
          videoId={videoId}
          opts={{
            height: "1",
            width: "1",
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              start: 0,
            },
          }}
          onReady={onReady}
        />
      </div>

      {/* Audio visualizer / progress */}
      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <div className="relative h-24 w-24 rounded-full border-2 border-primary/20 bg-secondary">
          {/* Progress ring */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-border"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progress * 289} 289`}
              strokeLinecap="round"
              className="text-primary transition-all"
            />
          </svg>
          <button
            onClick={isPlaying ? pauseSnippet : playSnippet}
            className="absolute inset-0 flex items-center justify-center rounded-full transition-colors hover:bg-primary/5"
            aria-label={isPlaying ? "Pause snippet" : "Play snippet"}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-primary" />
            ) : (
              <Play className="ml-1 h-8 w-8 text-primary" />
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex w-full items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {(progress * maxSeconds).toFixed(1)}s
          </span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {maxSeconds.toFixed(1)}s
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={playSnippet}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Replay
        </Button>
      </div>
    </div>
  )
}
