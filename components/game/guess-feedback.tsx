"use client"

import { cn } from "@/lib/utils"
import { Check, X, Music } from "lucide-react"

interface GuessFeedbackProps {
  type: "correct" | "wrong" | "skipped"
  songTitle?: string
  artist?: string
  points?: number
}

export function GuessFeedback({ type, songTitle, artist, points }: GuessFeedbackProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 transition-all",
        type === "correct" && "border-primary/30 bg-primary/10",
        type === "wrong" && "border-destructive/30 bg-destructive/10",
        type === "skipped" && "border-muted-foreground/20 bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          type === "correct" && "bg-primary/20",
          type === "wrong" && "bg-destructive/20",
          type === "skipped" && "bg-muted"
        )}
      >
        {type === "correct" && <Check className="h-5 w-5 text-primary" />}
        {type === "wrong" && <X className="h-5 w-5 text-destructive" />}
        {type === "skipped" && <Music className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            type === "correct" && "text-primary",
            type === "wrong" && "text-destructive",
            type === "skipped" && "text-muted-foreground"
          )}
        >
          {type === "correct" && "Correct!"}
          {type === "wrong" && "Wrong! Try again"}
          {type === "skipped" && "Skipped"}
        </p>
        {(type === "correct" || type === "skipped") && songTitle && (
          <p className="text-xs text-muted-foreground">
            {songTitle}{artist ? ` - ${artist}` : ""}
          </p>
        )}
      </div>
      {type === "correct" && points !== undefined && (
        <div className="text-lg font-bold tabular-nums text-accent">+{points}</div>
      )}
    </div>
  )
}
