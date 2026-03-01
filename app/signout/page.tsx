import { signOut, auth } from "@/auth"
import { LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function SignOutPage() {
    const session = await auth()

    // If not logged in, just redirect to home
    if (!session?.user) {
        redirect("/")
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden my-8">

                {/* Decorative background flares */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">

                    {/* Header Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
                        <LogOut className="w-8 h-8 text-white ml-1" />
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Log Ud</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Er du sikker på, at du vil logge ud af Enehøje?</p>

                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/" })
                        }}
                        className="w-full space-y-4"
                    >
                        {/* Submit Button */}
                        <div className="pt-2">
                            <button type="submit" className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 dark:bg-black rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                                <div className="absolute inset-0 w-full h-full rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-400 via-teal-400 to-blue-500 blur-lg"></div>
                                <span className="relative z-10 flex items-center gap-2 text-lg text-white">
                                    Ja, log mig ud
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="w-full pt-4">
                        <Link href="/" className="w-full group inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-gray-700 dark:text-gray-300 transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 duration-500 text-gray-700 dark:text-gray-300" />
                            <span className="text-gray-700 dark:text-gray-300">Annuller</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
