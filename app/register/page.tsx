import { prisma } from "@/lib/db"
import { registerUser } from "./actions"
import Link from "next/link"

export default async function RegisterPage() {
    const shares = await prisma.share.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded shadow p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Opret Profil</h1>

                <form action={registerUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Navn</label>
                        <input type="text" name="name" required className="w-full p-2 border rounded" placeholder="Dit navn" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" name="email" required className="w-full p-2 border rounded" placeholder="din@email.dk" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Kodeord</label>
                        <input type="password" name="password" required className="w-full p-2 border rounded" placeholder="******" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Hvilken Andel tilhører du?</label>
                        <select name="shareId" required className="w-full p-2 border rounded">
                            <option value="">Vælg Andel...</option>
                            {shares.map(share => (
                                <option key={share.id} value={share.id}>{share.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Vælg den andel (hus/ejer) du er en del af.</p>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium">
                        Opret Profil
                    </button>
                </form>

                <div className="mt-4 text-center text-sm">
                    Har du allerede en bruger? <Link href="/api/auth/signin" className="text-blue-600 hover:underline">Log ind</Link>
                </div>
            </div>
        </div>
    )
}
