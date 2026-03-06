"use client"

import { useState } from "react"
import { Paperclip, Loader2, X } from "lucide-react"

interface AttachmentUploaderProps {
    onUploadComplete?: (attachment: any) => void
    onError?: (error: string) => void
    // Add optional parent IDs here as we build modules
    postId?: string
    // documentId?: string
    // albumId?: string
}

export function AttachmentUploader({ onUploadComplete, onError, postId }: AttachmentUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 10MB limit for general attachments (can be raised if needed)
        if (file.size > 10 * 1024 * 1024) {
            onError?.("Filen er for stor. Maks 10 MB.")
            e.target.value = "" // Reset
            return
        }

        setIsUploading(true)
        setProgress(10)

        try {
            // 1. Get Presigned S3 URL
            const presignRes = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            })

            if (!presignRes.ok) throw new Error("Kunne ikke oprette sikker upload-forbindelse.")

            const { signedUrl, publicUrl, key } = await presignRes.json()
            setProgress(40)

            // 2. Upload file directly to AWS S3 bypassing Vercel limits
            const uploadRes = await fetch(signedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file
            })

            if (!uploadRes.ok) throw new Error("Fejl under upload af filen til skyen.")
            setProgress(80)

            // 3. Register the file in Postgres DB via our new Attachment API
            const dbRes = await fetch("/api/attachments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: publicUrl,
                    fileKey: key,
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size,
                    postId // Link to parent if provided
                })
            })

            if (!dbRes.ok) throw new Error("Filen blev uploadet, men kunne ikke knyttes til sagen i databasen.")

            const attachmentRecord = await dbRes.json()
            setProgress(100)

            // Allow pingback to parent component
            onUploadComplete?.(attachmentRecord)

        } catch (error: any) {
            console.error(error)
            onError?.(error.message || "Der skete en ukendt fejl.")
        } finally {
            setIsUploading(false)
            setProgress(0)
            e.target.value = "" // Reset file input
        }
    }

    return (
        <div className="relative inline-block">
            <label
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer
                    ${isUploading
                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 pointer-events-none'
                        : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:-translate-y-0.5 shadow-sm'
                    }
                `}
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                <span>{isUploading ? `Uploader... ${progress}%` : 'Vedhæft Fil'}</span>

                <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />
            </label>

            {/* Extremely subtle progress bar overlay */}
            {isUploading && (
                <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-xl transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
            )}
        </div>
    )
}
