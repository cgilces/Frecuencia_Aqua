import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            role: 'ADMIN' | 'VENDEDOR' | 'DESPACHADOR'
            assigned_routes: string[]
            username: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: 'ADMIN' | 'VENDEDOR' | 'DESPACHADOR'
        assigned_routes: string[]
        username: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: 'ADMIN' | 'VENDEDOR' | 'DESPACHADOR'
        assigned_routes: string[]
        username: string
    }
}
