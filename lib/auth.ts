import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const users = await sql`
          SELECT id, name, email, image, password_hash
          FROM users WHERE email = ${email}
        `

        if (users.length === 0) return null

        const user = users[0]
        if (!user.password_hash) return null

        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        // Upsert user for OAuth sign-ins
        const existing = await sql`
          SELECT id FROM users WHERE email = ${user.email}
        `

        if (existing.length === 0) {
          const result = await sql`
            INSERT INTO users (name, email, email_verified, image)
            VALUES (${user.name}, ${user.email}, NOW(), ${user.image})
            RETURNING id
          `
          user.id = result[0].id
        } else {
          user.id = existing[0].id
          await sql`
            UPDATE users SET
              name = COALESCE(${user.name}, name),
              image = COALESCE(${user.image}, image),
              email_verified = COALESCE(email_verified, NOW()),
              updated_at = NOW()
            WHERE email = ${user.email}
          `
        }

        // Upsert account link
        if (account.providerAccountId) {
          const existingAccount = await sql`
            SELECT id FROM accounts
            WHERE provider = ${account.provider}
            AND provider_account_id = ${account.providerAccountId}
          `
          if (existingAccount.length === 0) {
            await sql`
              INSERT INTO accounts (user_id, type, provider, provider_account_id, access_token, refresh_token, expires_at, token_type, scope, id_token)
              VALUES (${user.id}, ${account.type}, ${account.provider}, ${account.providerAccountId}, ${account.access_token ?? null}, ${account.refresh_token ?? null}, ${account.expires_at ?? null}, ${account.token_type ?? null}, ${account.scope ?? null}, ${account.id_token ?? null})
              ON CONFLICT (provider, provider_account_id) DO NOTHING
            `
          }
        }
      }
    },
  },
})
