"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AttachmentUploader } from "@/components/AttachmentUploader"
import { Paperclip, X, Loader2, Send } from "lucide-react"

export function NewThreadClient() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [attachments, setAttachments] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUploadComplete = (attachment: any) => {
        setAttachments(prev => [...prev, attachment])
    }

    const handleRemoveAttachment = async (id: string) => {
        // Optimistically remove from UI
        setAttachments(prev => prev.filter(a => a.id !== id))

        // Try to delete from DB & S3
        try {
            await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
        } catch (e) {
            console.error("Failed to delete attachment", e)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) {
            setError("Både emne og besked skal udfyldes.")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch("/api/forum", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    attachmentIds: attachments.map(a => a.id)
                })
            })

            if (!res.ok) {
                throw new Error("Kunne ikke oprette samtalen. Prøv igen.")
            }

            const thread = await res.json()

            // Redirect straight to the new readable thread
            router.push(`/forum/${thread.id}`)
            router.refresh()

        } catch (err: any) {
            setError(err.message)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-white/50 dark:border-zinc-800/50 p-6 sm:p-8">

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium text-sm text-center">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Emne
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Hvad drejer diskussionen sig om?"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-lg"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Besked
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Skriv din besked her..."
                        rows={10}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-y"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Attachments Section */}
                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between mb-4 mt-4">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Vedhæftede filer ({attachments.length})
                        </span>
                        <AttachmentUploader
                            onUploadComplete={handleUploadComplete}
                            onError={(msg) => setError(msg)}
                        />
                    </div>

                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((file) => (
                                <div key={file.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm">
                                    <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                                        {file.filename}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(file.id)}
                                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Actions */}
                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800/50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        disabled={isSubmitting}
                    >
                        Annuller
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim() || !content.trim()}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Udgiver...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Opret samtale
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}
