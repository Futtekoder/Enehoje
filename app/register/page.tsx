
import { prisma } from "@/lib/db"
import { registerUser } from "./actions"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default async function RegisterPage() {
    const shares = await prisma.share.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-black p-4">
            <div className="max-w-md w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-zinc-800 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-950 dark:text-white mb-2">Opret Profil</h1>
                    <p className="text-gray-500 dark:text-gray-400">Bliv en del af det digitale fællesskab</p>
                </div>

                <form action={registerUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Navn</label>
                        <input type="text" name="name" required className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-zinc-800" placeholder="Dit navn" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" name="email" required className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-zinc-800" placeholder="din@email.dk" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Kodeord</label>
                        <input type="password" name="password" required className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-zinc-800" placeholder="••••••••" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Hvilken Andel tilhører du?</label>
                        <div className="relative">
                            <select name="shareId" required className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-zinc-800 appearance-none">
                                <option value="">Vælg Andel...</option>
                                {shares.map(share => (
                                    <option key={share.id} value={share.id}>{share.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Vælg den andel (hus/ejer) du er en del af.</p>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center group mt-6">
                        Opret Profil
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center text-sm text-gray-500">
                    Har du allerede en bruger? <Link href="/login" className="text-blue-600 font-medium hover:underline">Log ind</Link>
                </div>
            </div>
        </div>
    )
}
