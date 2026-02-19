import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get user stats
    const userRows = await sql`
      SELECT id, name, email, image, total_points, ranked_rating, games_played, correct_guesses, created_at
      FROM users
      WHERE id = ${session.user.id}
      LIMIT 1
    `

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userRows[0]

    // Get recent game sessions
    const recentGames = await sql`
      SELECT id, mode, total_songs, correct_guesses, total_points, status, created_at, completed_at
      FROM game_sessions
      WHERE user_id = ${session.user.id}
        AND status = 'completed'
      ORDER BY completed_at DESC
      LIMIT 20
    `

    // Get rank position
    const rankRows = await sql`
      SELECT COUNT(*) + 1 as rank
      FROM users
      WHERE total_points > ${user.total_points}
        AND games_played > 0
    `

    return NextResponse.json({
      user,
      recentGames,
      rank: rankRows[0]?.rank || 0,
    })
  } catch (error) {
    console.error("Profile error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
