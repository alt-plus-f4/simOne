"use client"

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react"
import { type GameMode, getSecondsForAttempt, calculateScore } from "@/lib/scoring"
import type { SongResult } from "@/components/game/song-search"

export interface GameSong extends SongResult {
  lyrics_lines?: string[]
}

interface GameState {
  sessionId: string | null
  mode: GameMode
  status: "idle" | "selecting" | "playing" | "guessing" | "correct" | "skipped" | "finished"
  songs: GameSong[]
  currentSongIndex: number
  attemptNumber: number
  maxSeconds: number
  totalPoints: number
  totalCorrect: number
  roundStartTime: number | null
  lastGuessPoints: number | null
  guessHistory: Array<{
    song: GameSong
    correct: boolean
    attempts: number
    points: number
  }>
}

type GameAction =
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "START_SESSION"; sessionId: string; songs: GameSong[] }
  | { type: "START_ROUND" }
  | { type: "WRONG_GUESS" }
  | { type: "CORRECT_GUESS"; points: number }
  | { type: "SKIP_SONG" }
  | { type: "NEXT_SONG" }
  | { type: "FINISH_GAME" }
  | { type: "RESET" }

const MAX_ATTEMPTS = 5

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode, status: "selecting" }

    case "START_SESSION":
      return {
        ...state,
        sessionId: action.sessionId,
        songs: action.songs,
        currentSongIndex: 0,
        attemptNumber: 1,
        maxSeconds: getSecondsForAttempt(1),
        totalPoints: 0,
        totalCorrect: 0,
        guessHistory: [],
        lastGuessPoints: null,
        status: "playing",
        roundStartTime: Date.now(),
      }

    case "START_ROUND":
      return {
        ...state,
        status: "playing",
        roundStartTime: Date.now(),
      }

    case "WRONG_GUESS": {
      const nextAttempt = state.attemptNumber + 1
      if (nextAttempt > MAX_ATTEMPTS) {
        const song = state.songs[state.currentSongIndex]
        return {
          ...state,
          status: "skipped",
          lastGuessPoints: 0,
          guessHistory: [
            ...state.guessHistory,
            { song, correct: false, attempts: state.attemptNumber, points: 0 },
          ],
        }
      }
      return {
        ...state,
        attemptNumber: nextAttempt,
        maxSeconds: getSecondsForAttempt(nextAttempt),
        status: "guessing",
      }
    }

    case "CORRECT_GUESS": {
      const song = state.songs[state.currentSongIndex]
      return {
        ...state,
        status: "correct",
        totalPoints: state.totalPoints + action.points,
        totalCorrect: state.totalCorrect + 1,
        lastGuessPoints: action.points,
        guessHistory: [
          ...state.guessHistory,
          {
            song,
            correct: true,
            attempts: state.attemptNumber,
            points: action.points,
          },
        ],
      }
    }

    case "SKIP_SONG": {
      const song = state.songs[state.currentSongIndex]
      return {
        ...state,
        status: "skipped",
        lastGuessPoints: 0,
        guessHistory: [
          ...state.guessHistory,
          { song, correct: false, attempts: state.attemptNumber, points: 0 },
        ],
      }
    }

    case "NEXT_SONG": {
      const nextIndex = state.currentSongIndex + 1
      if (nextIndex >= state.songs.length) {
        return { ...state, status: "finished" }
      }
      return {
        ...state,
        currentSongIndex: nextIndex,
        attemptNumber: 1,
        maxSeconds: getSecondsForAttempt(1),
        status: "playing",
        roundStartTime: Date.now(),
        lastGuessPoints: null,
      }
    }

    case "FINISH_GAME":
      return { ...state, status: "finished" }

    case "RESET":
      return initialState

    default:
      return state
  }
}

const initialState: GameState = {
  sessionId: null,
  mode: "audio",
  status: "idle",
  songs: [],
  currentSongIndex: 0,
  attemptNumber: 1,
  maxSeconds: 1,
  totalPoints: 0,
  totalCorrect: 0,
  roundStartTime: null,
  lastGuessPoints: null,
  guessHistory: [],
}

interface GameContextValue {
  state: GameState
  currentSong: GameSong | null
  setMode: (mode: GameMode) => void
  startSession: (songs: GameSong[]) => Promise<void>
  submitGuess: (guessTitle: string) => Promise<boolean>
  skipSong: () => void
  nextSong: () => void
  finishGame: () => Promise<void>
  reset: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const currentSong = state.songs[state.currentSongIndex] ?? null

  const setMode = useCallback((mode: GameMode) => {
    dispatch({ type: "SET_MODE", mode })
  }, [])

  const startSession = useCallback(
    async (songs: GameSong[]) => {
      try {
        const res = await fetch("/api/game/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: state.mode,
            songs: songs.map((s) => ({
              youtube_id: s.youtube_id,
              title: s.title,
              artist: s.artist,
              thumbnail_url: s.thumbnail_url,
            })),
          }),
        })
        const data = await res.json()
        dispatch({ type: "START_SESSION", sessionId: data.sessionId, songs })
      } catch {
        // Fallback: play without server session
        dispatch({
          type: "START_SESSION",
          sessionId: "local-" + Date.now(),
          songs,
        })
      }
    },
    [state.mode]
  )

  const submitGuess = useCallback(
    async (guessTitle: string): Promise<boolean> => {
      if (!currentSong) return false

      const timeTakenMs = state.roundStartTime
        ? Date.now() - state.roundStartTime
        : 10000

      // Normalize and compare
      const normalize = (s: string) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, " ")
          .trim()

      const normalGuess = normalize(guessTitle)
      const normalTitle = normalize(currentSong.title)
      const normalArtist = normalize(currentSong.artist || "")

      // Check for fuzzy match (contains or close match)
      const isCorrect =
        normalTitle.includes(normalGuess) ||
        normalGuess.includes(normalTitle) ||
        (normalArtist && normalGuess.includes(normalArtist) && normalTitle.split(" ").some(w => normalGuess.includes(w))) ||
        similarity(normalGuess, normalTitle) > 0.7

      if (isCorrect) {
        const points = calculateScore(state.mode, state.attemptNumber, timeTakenMs)

        // Report to server
        try {
          await fetch("/api/game/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: state.sessionId,
              songYoutubeId: currentSong.youtube_id,
              attemptNumber: state.attemptNumber,
              guessTitle,
              isCorrect: true,
              timeTakenMs,
              points,
            }),
          })
        } catch {
          // continue even if server fails
        }

        dispatch({ type: "CORRECT_GUESS", points })
        return true
      } else {
        // Report wrong guess
        try {
          await fetch("/api/game/guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: state.sessionId,
              songYoutubeId: currentSong.youtube_id,
              attemptNumber: state.attemptNumber,
              guessTitle,
              isCorrect: false,
              timeTakenMs,
              points: 0,
            }),
          })
        } catch {
          // continue
        }

        dispatch({ type: "WRONG_GUESS" })
        return false
      }
    },
    [currentSong, state.roundStartTime, state.mode, state.attemptNumber, state.sessionId]
  )

  const skipSong = useCallback(() => {
    dispatch({ type: "SKIP_SONG" })
  }, [])

  const nextSong = useCallback(() => {
    dispatch({ type: "NEXT_SONG" })
  }, [])

  const finishGame = useCallback(async () => {
    try {
      await fetch("/api/game/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          totalPoints: state.totalPoints,
          totalCorrect: state.totalCorrect,
          totalSongs: state.songs.length,
        }),
      })
    } catch {
      // continue
    }
    dispatch({ type: "FINISH_GAME" })
  }, [state.sessionId, state.totalPoints, state.totalCorrect, state.songs.length])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  return (
    <GameContext.Provider
      value={{
        state,
        currentSong,
        setMode,
        startSession,
        submitGuess,
        skipSong,
        nextSong,
        finishGame,
        reset,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

// Simple string similarity (Dice coefficient)
function similarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0
  const bigrams = new Map<string, number>()
  for (let i = 0; i < a.length - 1; i++) {
    const bigram = a.substring(i, i + 2)
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1)
  }
  let intersect = 0
  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.substring(i, i + 2)
    const count = bigrams.get(bigram) || 0
    if (count > 0) {
      bigrams.set(bigram, count - 1)
      intersect++
    }
  }
  return (2 * intersect) / (a.length + b.length - 2)
}
