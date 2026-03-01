import NextAuth, { AuthError } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

class PendingApprovalError extends AuthError {
    type = "PendingApprovalError" as any
}

class AccountRejectedError extends AuthError {
    type = "AccountRejectedError" as any
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string
                    }
                })

                if (!user || !user.password) {
                    return null
                }

                // Verify Password
                const isValid = await bcrypt.compare(credentials.password as string, user.password)

                if (isValid) {
                    if (user.status === "PENDING") {
                        throw new PendingApprovalError()
                    }
                    if (user.status === "REJECTED") {
                        throw new AccountRejectedError()
                    }
                    return user
                }

                return null
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.status = user.status
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
                session.user.role = token.role as string
                session.user.status = token.status as string
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        signOut: "/signout",
    },
})
