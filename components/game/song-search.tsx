"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Link as LinkIcon, Loader2, Music, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SongResult {
  youtube_id: string
  title: string
  artist: string
  thumbnail_url: string
}

interface SongSearchProps {
  onSelect: (song: SongResult) => void
  placeholder?: string
  disabled?: boolean
}

export function SongSearch({ onSelect, placeholder = "Paste a YouTube URL or search for a song...", disabled }: SongSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SongResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [mode, setMode] = useState<"search" | "url">("search")
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const searchSongs = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
        setShowResults(true)
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)

    // Check if it's a YouTube URL
    const ytUrlPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    if (ytUrlPattern.test(value)) {
      setMode("url")
      setResults([])
      setShowResults(false)
      return
    }

    setMode("search")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchSongs(value), 400)
  }

  const handleUrlSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/search?url=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.song) {
          onSelect(data.song)
          setQuery("")
          setShowResults(false)
        }
      }
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const selectSong = (song: SongResult) => {
    onSelect(song)
    setQuery("")
    setResults([])
    setShowResults(false)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder={placeholder}
            className="pl-9 pr-8"
            disabled={disabled}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("")
                setResults([])
                setShowResults(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {loading && (
            <Loader2 className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {mode === "url" && (
          <Button onClick={handleUrlSubmit} disabled={loading} size="sm" className="gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" />
            Load
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-lg">
          {results.map((song) => (
            <button
              key={song.youtube_id}
              onClick={() => selectSong(song)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent"
            >
              {song.thumbnail_url ? (
                <img
                  src={song.thumbnail_url}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
                  <Music className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium text-foreground")}>
                  {song.title}
                </p>
                {song.artist && (
                  <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
