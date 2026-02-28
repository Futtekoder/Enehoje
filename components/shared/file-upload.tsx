"use client"

import { useState } from "react"
import { UploadCloud, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface FileUploadProps {
    onUploadSuccess: (url: string) => void
    onUploadError?: (error: Error) => void
    accept?: string
    maxSizeMB?: number
}

export function FileUpload({ onUploadSuccess, onUploadError, accept = "image/*", maxSizeMB = 5 }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate size
        if (file.size > maxSizeMB * 1024 * 1024) {
            const err = new Error(`Filen er for stor. Maks tilladt er ${maxSizeMB}MB.`)
            setStatus("error")
            if (onUploadError) onUploadError(err)
            else alert(err.message)
            return
        }

        try {
            setIsUploading(true)
            setStatus("idle")
            setProgress(10)

            // 1. Get Presigned URL
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Kunne ikke hente upload URL")
            }

            const { signedUrl, publicUrl } = await res.json()
            setProgress(40)

            // 2. Upload file directly to S3
            const uploadRes = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            })

            if (!uploadRes.ok) {
                throw new Error("Fejl under upload til serveren")
            }

            setProgress(100)
            setStatus("success")

            // 3. Inform parent component
            onUploadSuccess(publicUrl)

        } catch (error: any) {
            console.error("Upload error:", error)
            setStatus("error")
            if (onUploadError) onUploadError(error)
        } finally {
            setIsUploading(false)
            setTimeout(() => setProgress(0), 2000) // Reset progress bar visually after a delay
        }
    }

    return (
        <div className="w-full">
            <label className={`
                relative flex flex-col items-center justify-center w-full h-32 
                border-2 border-dashed rounded-xl cursor-pointer transition-colors
                ${status === 'error' ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}
                ${status === 'success' ? 'border-green-300 bg-green-50 dark:bg-green-900/10' : ''}
                ${status === 'idle' ? 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800' : ''}
            `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 mb-3 text-blue-500 animate-spin" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Uploader fil...</p>
                            <div className="w-48 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-2 overflow-hidden">
                                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </>
                    ) : status === 'success' ? (
                        <>
                            <CheckCircle2 className="w-8 h-8 mb-3 text-green-500" />
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Fil uploadet succesfuldt!</p>
                        </>
                    ) : (
                        <>
                            {status === 'error' ? (
                                <XCircle className="w-8 h-8 mb-3 text-red-500" />
                            ) : (
                                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                            )}
                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">{status === 'error' ? 'Prøv igen' : 'Klik for at uploade'}</span> eller træk og slip
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Max {maxSizeMB}MB
                            </p>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept={accept}
                    disabled={isUploading}
                />
            </label>
        </div>
    )
}
