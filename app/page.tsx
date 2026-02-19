import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Headphones, Video, FileText, ArrowRight, Zap, Target, Trophy } from "lucide-react"

const gameModes = [
  {
    icon: Headphones,
    title: "Audio Mode",
    description: "Listen to a short audio snippet and guess the song. Snippets get longer with each attempt.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    icon: Video,
    title: "Video Mode",
    description: "Watch a brief video clip with the title hidden. Visual clues help you identify the track.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
  },
  {
    icon: FileText,
    title: "Lyrics Mode",
    description: "Read progressively revealed lyrics and guess the song. Each wrong guess reveals more lines.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/20",
  },
]

const features = [
  {
    icon: Zap,
    title: "Progressive Difficulty",
    description: "Snippets start at 1 second and grow with each attempt. Guess fast for bonus points.",
  },
  {
    icon: Target,
    title: "Smart Scoring",
    description: "Points based on speed, attempts used, and game mode. Every correct guess counts.",
  },
  {
    icon: Trophy,
    title: "Global Leaderboard",
    description: "Compete against other players. Climb from Bronze to Platinum rank.",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 pb-16 pt-20 text-center md:pb-24 md:pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-3.5 w-3.5" />
            Free to play - No API key required
          </div>

          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            How well do you{" "}
            <span className="text-primary">know</span> your music?
          </h1>

          <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
            Listen to audio snippets, watch video clips, or read lyrics and guess the song.
            Challenge yourself across three unique game modes.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/play">
                Start Playing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="/leaderboard">
                View Leaderboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Three Ways to Play</h2>
          <p className="mt-2 text-muted-foreground">Choose your challenge and test your music knowledge</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {gameModes.map((mode) => (
            <Link
              key={mode.title}
              href="/play"
              className={`group flex flex-col gap-4 rounded-xl border ${mode.borderColor} ${mode.bgColor} p-6 transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${mode.bgColor}`}>
                <mode.icon className={`h-6 w-6 ${mode.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{mode.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
              </div>
              <div className={`mt-auto flex items-center gap-1 text-sm font-medium ${mode.color}`}>
                Play now
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Simple rules, endless fun</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <div key={feature.title} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-foreground">
                  <span className="text-lg font-bold">{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-6 px-4 py-20 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Ready to test your ears?</h2>
        <p className="max-w-md text-muted-foreground">
          Sign up to save your scores, track your progress, and compete on the global leaderboard.
        </p>
        <div className="flex items-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">Create Account</Link>
          </Button>
          <Button size="lg" variant="ghost" className="text-muted-foreground" asChild>
            <Link href="/play">Play as Guest</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>SoundGuess - A music guessing game</p>
          <div className="flex items-center gap-4">
            <Link href="/play" className="hover:text-foreground">Play</Link>
            <Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
