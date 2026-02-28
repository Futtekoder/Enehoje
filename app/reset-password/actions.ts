"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function submitNewPassword(formData: FormData) {
    const token = formData.get("token") as string
    const password = formData.get("password") as string

    if (!token || !password) {
        return { error: "Manglende oplysninger." }
    }

    if (password.length < 6) {
        return { error: "Adgangskoden er for kort." }
    }

    try {
        // 1. Find and validate the token
        const resetRecord = await prisma.passwordResetToken.findUnique({
            where: { token }
        })

        if (!resetRecord) {
            return { error: "Ugyldigt eller udløbet link." }
        }

        // 2. Check Expiration
        if (new Date() > resetRecord.expires) {
            // Clean up the expired token
            await prisma.passwordResetToken.delete({ where: { token } })
            return { error: "Nulstillingslinket er udløbet. Anmod om et nyt." }
        }

        // 3. Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // 4. Update the user
        await prisma.user.update({
            where: { email: resetRecord.email },
            data: { password: hashedPassword }
        })

        // 5. Delete the token so it can't be reused
        await prisma.passwordResetToken.delete({
            where: { token }
        })

        return { success: true }
    } catch (error) {
        console.error("Password reset execution error:", error)
        return { error: "Kunne ikke gemme den nye adgangskode. Prøv igen senere." }
    }
}
