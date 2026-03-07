"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

export function DeleteButton({
    id,
    type,
    canDelete
}: {
    id: string;
    type: "thread" | "post";
    canDelete: boolean
}) {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!canDelete) return null

    const handleDelete = async () => {
        const confirmMsg = type === "thread"
            ? "Er du sikker på, at du vil slette hele denne samtale? Alle indlæg og vedhæftede filer vil blive slettet permanent."
            : "Er du sikker på, at du vil slette dette indlæg? Vedhæftede filer vil også blive slettet."

        if (!window.confirm(confirmMsg)) return

        setIsDeleting(true)
        try {
            const url = type === "thread" ? `/api/forum/${id}` : `/api/forum/posts/${id}`
            const res = await fetch(url, { method: "DELETE" })

            if (!res.ok) throw new Error("Fejl ved sletning")

            if (type === "thread") {
                window.location.href = "/forum"
            } else {
                window.location.reload()
            }
        } catch (error) {
            console.error(error)
            alert("Der skete en fejl. Kunne ikke slette.")
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
            title={type === "thread" ? "Slet samtale" : "Slet indlæg"}
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}
