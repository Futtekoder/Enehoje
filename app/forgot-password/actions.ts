"use server"

import { prisma } from "@/lib/db"
import { randomUUID } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get("email") as string

    if (!email) {
        return { error: "E-mail er påkrævet" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // We return success even if user doesn't exist to prevent email enumeration attacks
            return { success: true }
        }

        // Generate a cryptographically secure token
        const token = randomUUID()

        // Token expires in 1 hour
        const expires = new Date(Date.now() + 3600 * 1000)

        // Clean up any existing tokens for this user first
        await prisma.passwordResetToken.deleteMany({
            where: { email }
        })

        // Create the new reset token
        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires
            }
        })

        // NOTE: we will build the email sending portion next!
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`

        await sendPasswordResetEmail(email, resetLink)

        return { success: true }
    } catch (error) {
        console.error("Password reset error:", error)
        return { error: "Der opstod en intern fejl. Prøv igen senere." }
    }
}
