
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            role: string
            status: string
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        status: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        status: string
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser {
        role: string
        status: string
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        role: string
        status: string
    }
}
