"use client"

import { cn } from "@/lib/utils"

interface LyricsDisplayProps {
  lyrics: string[]
  revealedLines: number
}

export function LyricsDisplay({ lyrics, revealedLines }: LyricsDisplayProps) {
  if (lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/50 bg-secondary/50 p-8">
        <p className="text-sm text-muted-foreground">No lyrics available for this song</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-secondary/30 p-6">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Lyrics ({revealedLines}/{lyrics.length} lines revealed)
      </div>
      <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
        {lyrics.map((line, i) => {
          const isRevealed = i < revealedLines
          return (
            <p
              key={i}
              className={cn(
                "text-sm leading-relaxed transition-all duration-500",
                isRevealed
                  ? "text-foreground"
                  : "select-none text-transparent",
                !isRevealed && "bg-muted/50 rounded px-1"
              )}
              style={!isRevealed ? { filter: "blur(6px)", WebkitFilter: "blur(6px)" } : undefined}
            >
              {line || "\u00A0"}
            </p>
          )
        })}
      </div>
    </div>
  )
}
