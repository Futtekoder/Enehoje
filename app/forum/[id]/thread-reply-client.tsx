"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AttachmentUploader } from "@/components/AttachmentUploader"
import { Paperclip, X, Loader2, Send } from "lucide-react"

export function ThreadReplyClient({ threadId }: { threadId: string }) {
    const router = useRouter()
    const [content, setContent] = useState("")
    const [attachments, setAttachments] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUploadComplete = (attachment: any) => {
        setAttachments(prev => [...prev, attachment])
    }

    const handleRemoveAttachment = async (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id))
        try {
            await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
        } catch (e) {
            console.error("Failed to delete attachment", e)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch(`/api/forum/${threadId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    attachmentIds: attachments.map(a => a.id)
                })
            })

            if (!res.ok) {
                if (res.status === 403) throw new Error("Denne samtale er lukket/arkiveret.")
                throw new Error("Kunne ikke sende dit svar. Prøv igen.")
            }

            // Success - clear form and refresh page to see new post
            setContent("")
            setAttachments([])
            router.refresh()

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium text-sm">
                    {error}
                </div>
            )}

            <div className="focus-within:ring-2 focus-within:ring-blue-500 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden transition-shadow">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Skriv dit svar her..."
                    rows={4}
                    className="w-full px-4 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-y min-h-[120px]"
                    required
                    disabled={isSubmitting}
                />

                {/* Attached Files List (Inline) */}
                {attachments.length > 0 && (
                    <div className="px-4 pb-2 flex flex-wrap gap-2">
                        {attachments.map((file) => (
                            <div key={file.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-xs">
                                <Paperclip className="w-3 h-3 text-gray-400" />
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                                    {file.filename}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(file.id)}
                                    className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 hover:text-red-500 transition-colors ml-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Toolbar Context */}
                <div className="bg-gray-50 dark:bg-zinc-900/50 px-4 py-3 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800">
                    <AttachmentUploader
                        onUploadComplete={handleUploadComplete}
                        onError={(msg) => setError(msg)}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="inline-flex items-center justify-center px-6 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Svar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}
