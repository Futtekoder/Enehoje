"use server"

import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendAdminRegistrationNotification } from "@/lib/email"

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const shareId = formData.get("shareId") as string

    if (!name || !email || !password || !shareId) {
        throw new Error("Missing required fields")
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        // In a real app we'd return a form error, for now we throw
        throw new Error("Email already registered")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            shareId,
            role: "MEMBER", // Default role
            status: "PENDING", // Stays pending until admin approves
        },
    })

    // Fetch the share details for the email
    const share = await prisma.share.findUnique({
        where: { id: shareId },
        select: { name: true }
    })

    const shareName = share?.name || "Ukendt Andel"

    // Generate a secure, single-use token for 1-click email approvals
    const token = crypto.randomBytes(32).toString("hex")

    // Admin approval tokens expire in 7 days
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
        data: {
            identifier: `admin-approval-${newUser.id}`,
            token,
            expires
        }
    })

    // Compute the absolute URL based on Vercel deployment or localhost
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const approveLink = `${appUrl}/api/admin/users/moderate?token=${token}&action=APPROVE`
    const rejectLink = `${appUrl}/api/admin/users/moderate?token=${token}&action=REJECT`

    // Dispatch the email asynchronously
    await sendAdminRegistrationNotification(
        newUser.name || "Ukendt Navn",
        newUser.email,
        shareName,
        approveLink,
        rejectLink
    )

    redirect("/login?pending=true")
}
