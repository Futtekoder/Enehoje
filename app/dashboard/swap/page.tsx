import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { createSwapRequest } from "../actions"
import { getYearWeeks } from "@/lib/weeks"

export default async function SwapPage() {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: { share: true },
    })

    if (!user?.share) {
        return <div>You must be assigned to a Share to swap weeks.</div>
    }

    // Get all shares for the dropdown
    const allShares = await prisma.share.findMany()
    const otherShares = allShares.filter(s => s.id !== user.share?.id)

    return (
        <div className="container mx-auto p-6 max-w-lg">
            <h1 className="text-2xl font-bold mb-6">Anmod om Ugebytte</h1>

            <form action={createSwapRequest} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">År</label>
                    <input type="number" name="year" defaultValue={2025} className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Min Uge (som jeg vil bytte væk)</label>
                    <input type="number" name="myWeek" className="w-full p-2 border rounded" placeholder="E.g. 7" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Ønsket Uge</label>
                    <input type="number" name="targetWeek" className="w-full p-2 border rounded" placeholder="E.g. 12" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Ejer af ønsket uge</label>
                    <select name="targetShareId" className="w-full p-2 border rounded">
                        {otherShares.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Send Anmodning
                </button>
            </form>
        </div>
    )
}
