export type GameMode = "audio" | "video" | "lyrics"

const MODE_MULTIPLIER: Record<GameMode, number> = {
  audio: 1.0,
  video: 1.2,
  lyrics: 1.5,
}

const BASE_POINTS = 100
const PENALTY_PER_ATTEMPT = 25
const SPEED_BONUS_THRESHOLD_MS = 5000
const MAX_SPEED_BONUS = 25
const MIN_POINTS = 10

export function calculateScore(
  mode: GameMode,
  attemptNumber: number,
  timeTakenMs: number
): number {
  const baseScore = Math.max(
    BASE_POINTS - (attemptNumber - 1) * PENALTY_PER_ATTEMPT,
    MIN_POINTS
  )

  let speedBonus = 0
  if (timeTakenMs < SPEED_BONUS_THRESHOLD_MS) {
    speedBonus = Math.round(
      MAX_SPEED_BONUS * (1 - timeTakenMs / SPEED_BONUS_THRESHOLD_MS)
    )
  }

  const multiplier = MODE_MULTIPLIER[mode]

  return Math.round((baseScore + speedBonus) * multiplier)
}

export function getSecondsForAttempt(attemptNumber: number): number {
  // 1s, 2s, 4s, 7s, 11s, 16s
  const schedule = [1, 2, 4, 7, 11, 16]
  return schedule[Math.min(attemptNumber - 1, schedule.length - 1)]
}

export type RankTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond"

export function getRankTier(totalPoints: number): RankTier {
  if (totalPoints >= 5000) return "Diamond"
  if (totalPoints >= 2000) return "Platinum"
  if (totalPoints >= 1000) return "Gold"
  if (totalPoints >= 500) return "Silver"
  return "Bronze"
}

export function getRankColor(tier: RankTier): string {
  switch (tier) {
    case "Diamond":
      return "text-cyan-400"
    case "Platinum":
      return "text-violet-400"
    case "Gold":
      return "text-amber-400"
    case "Silver":
      return "text-zinc-300"
    case "Bronze":
      return "text-orange-600"
  }
}

export function getRankBgColor(tier: RankTier): string {
  switch (tier) {
    case "Diamond":
      return "bg-cyan-400/10 border-cyan-400/30"
    case "Platinum":
      return "bg-violet-400/10 border-violet-400/30"
    case "Gold":
      return "bg-amber-400/10 border-amber-400/30"
    case "Silver":
      return "bg-zinc-300/10 border-zinc-300/30"
    case "Bronze":
      return "bg-orange-600/10 border-orange-600/30"
  }
}
