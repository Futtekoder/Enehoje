import { auth } from "@/auth"
import { createPost } from "../../actions"

export default async function NewPostPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params
    const session = await auth()

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Nyt Indlæg ({categoryId})</h1>

            <form action={createPost} className="space-y-4">
                <input type="hidden" name="category" value={categoryId} />

                <div>
                    <label className="block text-sm font-medium mb-1">Titel</label>
                    <input type="text" name="title" required className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Indhold</label>
                    <textarea name="content" required rows={5} className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Vedhæft fil (Valgfri)</label>
                    <input type="file" name="file" className="w-full p-2 border rounded" />
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Opret Indlæg
                </button>
            </form>
        </div>
    )
}
