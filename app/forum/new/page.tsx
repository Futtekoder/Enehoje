import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { NewThreadClient } from "./new-thread-client"

export default async function NewForumThreadPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/")
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8 relative z-10">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm mb-2">
                    Start ny samtale
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Opret et nyt oplæg til Enehøje forum.
                    Når du udgiver samtalen, sendes der en e-mail til foreningens medlemmer.
                </p>
            </div>

            <NewThreadClient />
        </div>
    )
}
