"use client"

import type { GameMode } from "@/lib/scoring"
import { Headphones, Video, FileText } from "lucide-react"

const modes: Array<{
  id: GameMode
  icon: typeof Headphones
  title: string
  description: string
  color: string
  bgColor: string
  borderColor: string
}> = [
  {
    id: "audio",
    icon: Headphones,
    title: "Audio Mode",
    description:
      "Listen to a short audio snippet that gets longer with each attempt. Guess the song from sound alone.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20 hover:border-primary/40",
  },
  {
    id: "video",
    icon: Video,
    title: "Video Mode",
    description:
      "Watch a brief video clip with the title hidden. Visual and audio clues help you identify the track.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20 hover:border-accent/40",
  },
  {
    id: "lyrics",
    icon: FileText,
    title: "Lyrics Mode",
    description:
      "Read lyrics that are progressively revealed. Each wrong guess shows more lines to help you out.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/20 hover:border-chart-3/40",
  },
]

interface ModeSelectorProps {
  onSelect: (mode: GameMode) => void
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold md:text-3xl">Choose Your Mode</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a game mode and test your music knowledge
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`flex flex-col items-start gap-4 rounded-xl border ${mode.borderColor} ${mode.bgColor} p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${mode.bgColor}`}
            >
              <mode.icon className={`h-6 w-6 ${mode.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {mode.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {mode.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
