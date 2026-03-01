import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const action = searchParams.get("action")

    if (!token || !action || (action !== "APPROVE" && action !== "REJECT")) {
        return new NextResponse("Invalid request parameters", { status: 400 })
    }

    try {
        // Find the valid, unexpired token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token }
        })

        if (!verificationToken) {
            return generateHtmlResponse("Ugyldigt eller udløbet link", "Dette godkendelseslink eksisterer ikke eller er allerede blevet brugt.", "bg-red-50 text-red-900 border-red-200")
        }

        if (verificationToken.expires < new Date()) {
            return generateHtmlResponse("Linket er udløbet", "Dette godkendelseslink er overskredet sin gyldighedsperiode på 7 dage.", "bg-red-50 text-red-900 border-red-200")
        }

        // The identifier is shaped like: admin-approval-[userId]
        const userId = verificationToken.identifier.replace("admin-approval-", "")

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return generateHtmlResponse("Bruger ikke fundet", "Den anmodede bruger kunne ikke findes i systemet.", "bg-red-50 text-red-900 border-red-200")
        }

        if (user.status !== "PENDING") {
            // Clean up token if it somehow lingered
            await prisma.verificationToken.delete({ where: { token } })
            return generateHtmlResponse("Allerede behandlet", `Denne bruger er allerede blevet ${user.status === 'APPROVED' ? 'godkendt' : 'afvist'}.`, "bg-blue-50 text-blue-900 border-blue-200")
        }

        // Apply action
        const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED"

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { status: newStatus }
            }),
            prisma.verificationToken.delete({
                where: { token }
            })
        ])

        const successTitle = action === "APPROVE" ? "Bruger Godkendt!" : "Bruger Afvist"
        const successMessage = action === "APPROVE"
            ? `${user.name} har nu fået adgang til platformen.`
            : `${user.name}'s anmodning er blevet afvist.`
        const colorClasses = action === "APPROVE"
            ? "bg-green-50 text-green-900 border-green-200"
            : "bg-orange-50 text-orange-900 border-orange-200"

        return generateHtmlResponse(successTitle, successMessage, colorClasses)

    } catch (error) {
        console.error("Error processing admin moderation:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

// Helper to return a styled HTML response so the admin sees a nice UI when clicking the email link
function generateHtmlResponse(title: string, message: string, colorClasses: string) {
    const html = `
    <!DOCTYPE html>
    <html lang="da">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Enehøje Admin</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-6 ${colorClasses.split(' ')[0]}">
                <span class="text-2xl">🏝️</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">${title}</h1>
            <p class="text-gray-600 mb-8">${message}</p>
            <a href="/" class="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition">
                Gå til Enehøje Forside
            </a>
        </div>
    </body>
    </html>
    `

    return new NextResponse(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
        },
    })
}
