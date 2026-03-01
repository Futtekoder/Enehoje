import { prisma } from "@/lib/db"
import { registerUser } from "./actions"
import Link from "next/link"
import { UserPlus, Mail, Lock, User, ArrowRight, Home } from "lucide-react"

export default async function RegisterPage() {
    const shares = await prisma.share.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="min-h-screen flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden my-8">

                {/* Decorative background flares */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">

                    {/* Header Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-6">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Opret Profil</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">Bliv en del af det digitale fællesskab på Enehøje</p>

                    <form action={registerUser} className="w-full space-y-5">

                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Navn</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full p-4 pl-12 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-teal-500 rounded-xl transition-all shadow-sm text-base font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                    placeholder="Dit fulde navn"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full p-4 pl-12 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-teal-500 rounded-xl transition-all shadow-sm text-base font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                    placeholder="din@email.dk"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Kodeord</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full p-4 pl-12 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-teal-500 rounded-xl transition-all shadow-sm text-base font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Share Selection Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Hvilken Andel tilhører du?</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
                                    <Home className="w-5 h-5 text-gray-400" />
                                </div>
                                <select
                                    name="shareId"
                                    required
                                    className="w-full p-4 pl-12 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-2 border-transparent focus:border-teal-500 rounded-xl transition-all shadow-sm text-base font-medium appearance-none cursor-pointer relative z-0"
                                >
                                    <option value="" disabled selected>Vælg Andel...</option>
                                    {shares.map(share => (
                                        <option key={share.id} value={share.id}>{share.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 z-10">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 ml-1 mt-1 font-medium">Vælg den andel (hus/ejer) du er forbundet til.</p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button type="submit" className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 dark:bg-black rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                                <div className="absolute inset-0 w-full h-full rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-teal-400 via-blue-400 to-teal-500 blur-lg"></div>
                                <span className="relative z-10 flex items-center gap-2 text-lg">
                                    Opret Profil
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-500" />
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        Har du allerede en bruger? <Link href="/login" className="text-teal-500 hover:text-teal-600 font-bold transition-colors">Log ind</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
