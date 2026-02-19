import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sortBy = searchParams.get("sort") || "total_points"
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  const allowedSorts = ["total_points", "games_played", "correct_guesses", "ranked_rating"]
  const sortColumn = allowedSorts.includes(sortBy) ? sortBy : "total_points"

  try {
    let rows
    if (sortColumn === "total_points") {
      rows = await sql`
        SELECT id, name, image, total_points, games_played, correct_guesses, ranked_rating
        FROM users
        WHERE games_played > 0
        ORDER BY total_points DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (sortColumn === "games_played") {
      rows = await sql`
        SELECT id, name, image, total_points, games_played, correct_guesses, ranked_rating
        FROM users
        WHERE games_played > 0
        ORDER BY games_played DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (sortColumn === "correct_guesses") {
      rows = await sql`
        SELECT id, name, image, total_points, games_played, correct_guesses, ranked_rating
        FROM users
        WHERE games_played > 0
        ORDER BY correct_guesses DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      rows = await sql`
        SELECT id, name, image, total_points, games_played, correct_guesses, ranked_rating
        FROM users
        WHERE games_played > 0
        ORDER BY ranked_rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return NextResponse.json({ players: rows, sort: sortColumn })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ players: [], error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
