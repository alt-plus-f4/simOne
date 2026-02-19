import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth()
  const body = await request.json()
  const { sessionId, songYoutubeId, attemptNumber, guessTitle, isCorrect, timeTakenMs, points } = body

  if (!sessionId || !songYoutubeId) {
    return NextResponse.json({ error: "sessionId and songYoutubeId are required" }, { status: 400 })
  }

  // Skip DB for local sessions
  if (sessionId.startsWith("local-")) {
    return NextResponse.json({ ok: true })
  }

  try {
    const userId = session?.user?.id || null

    // Get song ID from youtube_id
    const songRows = await sql`SELECT id FROM songs WHERE youtube_id = ${songYoutubeId} LIMIT 1`
    const songId = songRows.length > 0 ? songRows[0].id : null

    // Record the guess
    await sql`
      INSERT INTO guesses (session_id, song_id, user_id, attempt_number, guessed_title, is_correct, time_taken_ms, points_awarded)
      VALUES (${sessionId}, ${songId}, ${userId}, ${attemptNumber}, ${guessTitle || ""}, ${isCorrect}, ${timeTakenMs || 0}, ${points || 0})
    `

    // If correct, update session stats
    if (isCorrect) {
      await sql`
        UPDATE game_sessions
        SET correct_guesses = correct_guesses + 1,
            total_points = total_points + ${points || 0}
        WHERE id = ${sessionId}
      `
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Guess error:", error)
    return NextResponse.json({ error: "Failed to record guess" }, { status: 500 })
  }
}
