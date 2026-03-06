import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { url, fileKey, filename, mimeType, size, postId /* add other foreign keys here when built */ } = body

        if (!url || !filename || !mimeType || !size) {
            return new NextResponse("Missing required file metadata", { status: 400 })
        }

        const attachment = await prisma.attachment.create({
            data: {
                url,
                fileKey,
                filename,
                mimeType,
                size,
                uploadedByUserId: session.user.id,
                postId: postId || null,
            }
        })

        return NextResponse.json(attachment)
    } catch (error) {
        console.error("Error creating attachment:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
