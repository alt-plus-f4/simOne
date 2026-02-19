import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth()
  const body = await request.json()
  const { sessionId, totalPoints, totalCorrect, totalSongs } = body

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
  }

  // Skip DB for local sessions
  if (sessionId.startsWith("local-")) {
    return NextResponse.json({ ok: true })
  }

  try {
    // Update game session
    await sql`
      UPDATE game_sessions
      SET status = 'completed',
          total_points = ${totalPoints || 0},
          correct_guesses = ${totalCorrect || 0},
          total_songs = ${totalSongs || 0},
          completed_at = NOW()
      WHERE id = ${sessionId}
    `

    // Update user stats if authenticated
    if (session?.user?.id) {
      await sql`
        UPDATE users
        SET total_points = total_points + ${totalPoints || 0},
            games_played = games_played + 1,
            correct_guesses = correct_guesses + ${totalCorrect || 0},
            updated_at = NOW()
        WHERE id = ${session.user.id}
      `
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Game end error:", error)
    return NextResponse.json({ error: "Failed to end game" }, { status: 500 })
  }
}
