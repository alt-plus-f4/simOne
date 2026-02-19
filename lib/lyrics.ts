interface LRCLibResult {
  id: number
  trackName: string
  artistName: string
  albumName: string
  duration: number
  instrumental: boolean
  plainLyrics: string | null
  syncedLyrics: string | null
}

export interface LyricsData {
  trackName: string
  artistName: string
  lines: string[]
  synced: boolean
}

export async function searchLyrics(
  query: string
): Promise<LyricsData | null> {
  try {
    const res = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "SoundGuess/1.0 (https://soundguess.app)",
        },
      }
    )

    if (!res.ok) return null

    const results: LRCLibResult[] = await res.json()

    // Find first result with plain lyrics
    const match = results.find(
      (r) => r.plainLyrics && !r.instrumental
    )

    if (!match || !match.plainLyrics) return null

    const lines = match.plainLyrics
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    return {
      trackName: match.trackName,
      artistName: match.artistName,
      lines,
      synced: !!match.syncedLyrics,
    }
  } catch {
    return null
  }
}

export function getLyricsForAttempt(
  lines: string[],
  attemptNumber: number,
  maxAttempts: number = 6
): { visible: string[]; hidden: number } {
  // Show progressively more lyrics per attempt
  // Attempt 1: ~10% of lines, Attempt 6: all lines
  const fraction = Math.min(attemptNumber / maxAttempts, 1)
  const visibleCount = Math.max(
    1,
    Math.ceil(lines.length * fraction * 0.8)
  )

  return {
    visible: lines.slice(0, visibleCount),
    hidden: Math.max(0, lines.length - visibleCount),
  }
}
