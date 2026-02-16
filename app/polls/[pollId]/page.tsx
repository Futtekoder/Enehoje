import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { castVote } from "../actions"
import { redirect } from "next/navigation"

export default async function PollPage({ params }: { params: Promise<{ pollId: string }> }) {
    const { pollId } = await params
    const session = await auth()

    if (!session?.user?.email) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            options: {
                include: { votes: true }
            },
            votes: true
        }
    })

    if (!poll) return <div>Afstemning ikke fundet.</div>

    const hasVoted = poll.votes.some(v => v.userId === user?.id)
    const totalVotes = poll.votes.length

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">{poll.question}</h1>
            <div className="text-gray-500 text-sm mb-6">
                {totalVotes} stemmer • Status: {poll.isActive ? "Aktiv" : "Afsluttet"}
            </div>

            {!hasVoted && poll.isActive ? (
                <form action={castVote} className="space-y-4">
                    <input type="hidden" name="pollId" value={poll.id} />
                    <div className="space-y-2">
                        {poll.options.map(option => (
                            <label key={option.id} className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                                <input type="radio" name="optionId" value={option.id} required className="w-4 h-4" />
                                <span>{option.text}</span>
                            </label>
                        ))}
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                        Stem
                    </button>
                </form>
            ) : (
                <div className="space-y-4">
                    {poll.options.map(option => {
                        const count = option.votes.length
                        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
                        const isMyVote = option.votes.some(v => v.userId === user?.id)

                        return (
                            <div key={option.id} className="p-4 border rounded bg-gray-50 dark:bg-zinc-900">
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold">{option.text} {isMyVote && "(Din stemme)"}</span>
                                    <span>{percentage}% ({count})</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        )
                    })}

                    {hasVoted && <p className="text-sm text-green-600 text-center mt-4">Tak for din stemme!</p>}
                </div>
            )}
        </div>
    )
}
