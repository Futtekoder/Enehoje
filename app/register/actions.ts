"use server"

import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

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
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            shareId,
            role: "MEMBER", // Default role
        },
    })

    redirect("/api/auth/signin")
}
