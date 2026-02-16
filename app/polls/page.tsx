import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function PollsPage() {
    const session = await auth()

    const polls = await prisma.poll.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { votes: true } } }
    })

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Afstemninger</h1>
                <Link href="/polls/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Opret Afstemning
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {polls.map(poll => (
                    <Link key={poll.id} href={`/polls/${poll.id}`} className="block p-6 border rounded shadow hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-semibold">{poll.question}</h2>
                            <span className={poll.isActive ? "text-green-600 border border-green-600 px-2 py-0.5 rounded text-xs" : "text-gray-500 border px-2 py-0.5 rounded text-xs"}>
                                {poll.isActive ? "Aktiv" : "Afsluttet"}
                            </span>
                        </div>
                        <div className="text-gray-500 text-sm mt-2">
                            {poll._count.votes} stemmer • Deadline: {poll.deadline ? poll.deadline.toLocaleDateString() : "Ingen"}
                        </div>
                    </Link>
                ))}

                {polls.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        Ingen afstemninger fundet.
                    </div>
                )}
            </div>
        </div>
    )
}
