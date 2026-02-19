"use client"

import { cn } from "@/lib/utils"

interface AttemptTrackerProps {
  current: number
  max?: number
  results?: ("correct" | "wrong" | "pending")[]
}

export function AttemptTracker({ current, max = 5, results = [] }: AttemptTrackerProps) {
  const dots = Array.from({ length: max }, (_, i) => {
    if (results[i] === "correct") return "correct"
    if (results[i] === "wrong") return "wrong"
    if (i + 1 === current) return "active"
    if (i + 1 < current) return "wrong"
    return "pending"
  })

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Attempt {Math.min(current, max)}/{max}
      </span>
      <div className="flex items-center gap-1.5">
        {dots.map((status, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              status === "correct" && "bg-primary scale-110",
              status === "wrong" && "bg-destructive",
              status === "active" && "bg-foreground animate-pulse",
              status === "pending" && "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  )
}
