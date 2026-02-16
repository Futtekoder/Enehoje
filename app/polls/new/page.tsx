import { auth } from "@/auth"
import { createPoll } from "../actions"

export default async function NewPollPage() {
    const session = await auth()

    return (
        <div className="container mx-auto p-6 max-w-lg">
            <h1 className="text-2xl font-bold mb-6">Ny Afstemning</h1>

            <form action={createPoll} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Spørgsmål</label>
                    <input type="text" name="question" required className="w-full p-2 border rounded" placeholder="Hvad skal vi..." />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Deadline (Valgfri)</label>
                    <input type="date" name="deadline" className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Svarmuligheder</label>
                    <div className="space-y-2">
                        <input type="text" name="options" required className="w-full p-2 border rounded" placeholder="Mulighed 1" />
                        <input type="text" name="options" required className="w-full p-2 border rounded" placeholder="Mulighed 2" />
                        <input type="text" name="options" className="w-full p-2 border rounded" placeholder="Mulighed 3 (valgfri)" />
                        <input type="text" name="options" className="w-full p-2 border rounded" placeholder="Mulighed 4 (valgfri)" />
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Opret Afstemning
                </button>
            </form>
        </div>
    )
}
