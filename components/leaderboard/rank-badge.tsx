"use client"

import { cn } from "@/lib/utils"
import { getRankTier, getRankColor, getRankBgColor, type RankTier } from "@/lib/scoring"
import { Shield } from "lucide-react"

interface RankBadgeProps {
  points: number
  size?: "sm" | "md"
}

export function RankBadge({ points, size = "sm" }: RankBadgeProps) {
  const tier = getRankTier(points)
  const color = getRankColor(tier)
  const bgColor = getRankBgColor(tier)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        bgColor,
        color,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm"
      )}
    >
      <Shield className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      {tier}
    </span>
  )
}
