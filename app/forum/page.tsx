import { auth } from "@/auth"
import Link from "next/link"

const CATEGORIES = [
    { id: "general", name: "Generelt", description: "Diskussioner om alt og intet" },
    { id: "maintenance", name: "Vedligehold", description: "Rapportering af fejl og mangler" },
    { id: "calendar", name: "Kalender", description: "Spørgsmål til uger og bytning" },
    { id: "economy", name: "Økonomi", description: "Budget, regnskab og kontingent" },
]

export default async function ForumPage() {
    const session = await auth()

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Forum</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => (
                    <Link
                        key={category.id}
                        href={`/forum/${category.id}`}
                        className="block p-6 border rounded shadow hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                    >
                        <h2 className="text-xl font-semibold">{category.name}</h2>
                        <p className="text-gray-500 mt-2">{category.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
