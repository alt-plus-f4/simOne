import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { extractVideoId } from "@/lib/youtube"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const url = searchParams.get("url")

  // URL mode: extract video ID and fetch metadata via oEmbed
  if (url) {
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    try {
      // Check if song already exists in DB
      const existing = await sql`SELECT * FROM songs WHERE youtube_id = ${videoId} LIMIT 1`
      if (existing.length > 0) {
        return NextResponse.json({
          song: {
            youtube_id: existing[0].youtube_id,
            title: existing[0].title,
            artist: existing[0].artist || "",
            thumbnail_url: existing[0].thumbnail_url || "",
          },
        })
      }

      // Fetch metadata from YouTube oEmbed
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      const oembedRes = await fetch(oembedUrl)

      if (!oembedRes.ok) {
        return NextResponse.json({ error: "Could not fetch video info" }, { status: 404 })
      }

      const oembed = await oembedRes.json()
      const title = oembed.title || "Unknown"
      const artist = oembed.author_name || ""
      const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

      // Save to DB for future searches
      await sql`
        INSERT INTO songs (youtube_id, title, artist, thumbnail_url)
        VALUES (${videoId}, ${title}, ${artist}, ${thumbnail})
        ON CONFLICT (youtube_id) DO NOTHING
      `

      return NextResponse.json({
        song: {
          youtube_id: videoId,
          title,
          artist,
          thumbnail_url: thumbnail,
        },
      })
    } catch (error) {
      console.error("Search URL error:", error)
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 })
    }
  }

  // Search mode: search from DB of previously added songs
  if (query && query.length >= 2) {
    try {
      const results = await sql`
        SELECT youtube_id, title, artist, thumbnail_url
        FROM songs
        WHERE title ILIKE ${"%" + query + "%"}
           OR artist ILIKE ${"%" + query + "%"}
        ORDER BY created_at DESC
        LIMIT 10
      `

      return NextResponse.json({ results })
    } catch (error) {
      console.error("Search error:", error)
      return NextResponse.json({ results: [] })
    }
  }

  return NextResponse.json({ results: [] })
}
