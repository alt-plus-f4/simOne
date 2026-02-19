"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, SkipForward } from "lucide-react"

interface GuessInputProps {
  onSubmit: (guess: string) => void
  onSkip: () => void
  disabled?: boolean
  attempt: number
  maxAttempts?: number
}

export function GuessInput({ onSubmit, onSkip, disabled, attempt, maxAttempts = 5 }: GuessInputProps) {
  const [value, setValue] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSubmit(value.trim())
    setValue("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Guess the song (attempt ${attempt}/${maxAttempts})...`}
          disabled={disabled}
          className="flex-1"
          autoFocus
        />
        <Button type="submit" size="icon" disabled={disabled || !value.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Submit guess</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onSkip}
          disabled={disabled}
          title="Skip this song"
        >
          <SkipForward className="h-4 w-4" />
          <span className="sr-only">Skip song</span>
        </Button>
      </div>
    </form>
  )
}
