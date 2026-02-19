import { neon } from "@neondatabase/serverless"

let _instance: ReturnType<typeof neon> | null = null

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!_instance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    _instance = neon(process.env.DATABASE_URL)
  }
  return _instance(strings, ...values)
}
