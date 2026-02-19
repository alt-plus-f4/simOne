import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth()
  const body = await request.json()
  const { mode, songs } = body

  if (!mode || !songs || !Array.isArray(songs) || songs.length === 0) {
    return NextResponse.json({ error: "mode and songs are required" }, { status: 400 })
  }

  try {
    // Upsert songs into the songs table
    for (const song of songs) {
      await sql`
        INSERT INTO songs (youtube_id, title, artist, thumbnail_url)
        VALUES (${song.youtube_id}, ${song.title}, ${song.artist || ""}, ${song.thumbnail_url || ""})
        ON CONFLICT (youtube_id) DO NOTHING
      `
    }

    // Create game session
    const userId = session?.user?.id || null
    const result = await sql`
      INSERT INTO game_sessions (user_id, mode, total_songs, status)
      VALUES (${userId}, ${mode}, ${songs.length}, 'active')
      RETURNING id
    `

    return NextResponse.json({ sessionId: result[0].id })
  } catch (error) {
    console.error("Game start error:", error)
    return NextResponse.json({ error: "Failed to start game" }, { status: 500 })
  }
}
