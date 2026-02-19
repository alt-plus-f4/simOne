"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface VideoPlayerProps {
  videoId: string
  maxSeconds: number
  onSnippetEnd?: () => void
  autoPlay?: boolean
}

export function VideoPlayer({ videoId, maxSeconds, onSnippetEnd, autoPlay = false }: VideoPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showVideo, setShowVideo] = useState(false)

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
    setProgress(0)
    setIsPlaying(false)
    setShowVideo(false)
    clearTimers()
  }, [maxSeconds, clearTimers])

  const playSnippet = useCallback(() => {
    if (!playerRef.current) return
    clearTimers()
    playerRef.current.seekTo(0, true)
    playerRef.current.playVideo()
    setIsPlaying(true)
    setShowVideo(true)
    setProgress(0)

    const startTime = Date.now()
    progressInterval.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      setProgress(Math.min(elapsed / maxSeconds, 1))
    }, 50)

    timerRef.current = setTimeout(() => {
      playerRef.current?.pauseVideo()
      setIsPlaying(false)
      setShowVideo(false)
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
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border/50 bg-secondary">
        {/* Video container */}
        <div className="relative aspect-video">
          {!showVideo && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary">
              <button
                onClick={playSnippet}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 transition-colors hover:bg-primary/30"
                aria-label="Play video snippet"
              >
                <Play className="ml-1 h-8 w-8 text-primary" />
              </button>
            </div>
          )}
          <YouTube
            videoId={videoId}
            className="pointer-events-none"
            iframeClassName="w-full aspect-video"
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                start: 0,
              },
            }}
            onReady={onReady}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex w-full max-w-md items-center gap-2">
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

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={isPlaying ? pauseSnippet : playSnippet}
          className="gap-1.5"
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Play
            </>
          )}
        </Button>
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
