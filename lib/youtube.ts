export function extractVideoId(input: string): string | null {
  if (!input) return null

  // Direct video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim()
  }

  try {
    const url = new URL(input)

    // youtube.com/watch?v=ID
    if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
      return url.searchParams.get("v")
    }

    // youtu.be/ID
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("?")[0]
    }

    // youtube.com/embed/ID
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/embed/")[1]?.split("?")[0] || null
    }
  } catch {
    // Not a URL
  }

  return null
}

export interface OEmbedData {
  title: string
  author_name: string
  thumbnail_url: string
}

export async function fetchOEmbed(
  videoId: string
): Promise<OEmbedData | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    return (await res.json()) as OEmbedData
  } catch {
    return null
  }
}

export function getThumbnailUrl(
  videoId: string,
  quality: "default" | "hq" | "mq" | "sd" | "maxres" = "hq"
): string {
  const qualityMap = {
    default: "default",
    hq: "hqdefault",
    mq: "mqdefault",
    sd: "sddefault",
    maxres: "maxresdefault",
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

// Fuzzy match for song title guessing
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove parenthesized text
    .replace(/\[.*?\]/g, "") // remove bracketed text
    .replace(/official\s*(music\s*)?video/gi, "")
    .replace(/lyrics?\s*video/gi, "")
    .replace(/audio/gi, "")
    .replace(/ft\.?\s*.*/gi, "") // remove featured artists
    .replace(/feat\.?\s*.*/gi, "")
    .replace(/[^a-z0-9\s]/g, "") // remove special chars
    .replace(/\s+/g, " ")
    .trim()
}

export function isFuzzyMatch(guess: string, actual: string): boolean {
  const normalizedGuess = normalizeTitle(guess)
  const normalizedActual = normalizeTitle(actual)

  if (normalizedGuess === normalizedActual) return true

  // Check if one contains the other
  if (
    normalizedActual.includes(normalizedGuess) ||
    normalizedGuess.includes(normalizedActual)
  ) {
    const shorter = Math.min(normalizedGuess.length, normalizedActual.length)
    const longer = Math.max(normalizedGuess.length, normalizedActual.length)
    if (shorter / longer > 0.5) return true
  }

  // Levenshtein distance check
  const distance = levenshteinDistance(normalizedGuess, normalizedActual)
  const maxLength = Math.max(normalizedGuess.length, normalizedActual.length)
  return maxLength > 0 && distance / maxLength < 0.3
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  return matrix[b.length][a.length]
}
