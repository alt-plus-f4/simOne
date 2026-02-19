"use client"

import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface ScoreDisplayProps {
  points: number
  animate?: boolean
  size?: "sm" | "lg"
}

export function ScoreDisplay({ points, animate, size = "sm" }: ScoreDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 font-mono font-bold tabular-nums",
        size === "sm" && "text-lg",
        size === "lg" && "text-3xl",
        animate && "animate-score-pop"
      )}
    >
      <Star
        className={cn(
          "fill-accent text-accent",
          size === "sm" && "h-4 w-4",
          size === "lg" && "h-6 w-6"
        )}
      />
      <span className="text-accent">{points.toLocaleString()}</span>
    </div>
  )
}
