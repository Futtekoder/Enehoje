import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { deleteAttachmentAndFile } from "@/lib/s3-utils"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const resolvedParams = await params
        const attachmentId = resolvedParams.id
        const isAdmin = session.user.role === 'SYSTEM_ADMIN' || session.user.role === 'ANDEL_ADMIN'

        // The utility handles the verification, S3 request, and Database transaction.
        await deleteAttachmentAndFile(attachmentId, session.user.id, isAdmin)

        return new NextResponse(null, { status: 204 })
    } catch (error: any) {
        console.error("Error deleting attachment:", error)
        if (error.message === "Attachment not found") return new NextResponse("Not Found", { status: 404 })
        if (error.message === "Unauthorized to delete this attachment") return new NextResponse("Forbidden", { status: 403 })
        return new NextResponse("Internal Error", { status: 500 })
    }
}
