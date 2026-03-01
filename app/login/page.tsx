import { signIn, auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    const session = await auth()
    if (session?.user) {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">

            {/* The Login Card */}
            <div className="w-full max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">

                {/* Decorative background flares */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">

                    {/* Header Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Log Ind</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">Velkommen tilbage til Enehøje</p>

                    {/* Error States */}
                    <div className="w-full space-y-3 mb-6">
                        {searchParams?.error === "PENDING_APPROVAL" && (
                            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-sm border border-yellow-200 dark:border-yellow-800/50">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>Din konto afventer godkendelse fra en administrator. Du vil modtage en e-mail når du kan logge ind.</p>
                            </div>
                        )}
                        {searchParams?.error === "ACCOUNT_REJECTED" && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-xl text-sm border border-red-200 dark:border-red-800/50">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>Din konto er desværre blevet afvist af en administrator.</p>
                            </div>
                        )}
                        {searchParams?.error === "CredentialsSignin" && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-xl text-sm border border-red-200 dark:border-red-800/50">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>Forkert email eller adgangskode. Prøv venligst igen.</p>
                            </div>
                        )}
                    </div>

                    <form
                        action={async (formData) => {
                            "use server"
                            try {
                                await signIn("credentials", formData, { redirectTo: "/dashboard" })
                            } catch (error: any) {
                                const errorString = String(error.message || error)

                                if (error?.type === "PendingApprovalError" || errorString.includes("PENDING_APPROVAL") || errorString.includes("PendingApprovalError")) {
                                    redirect("/login?error=PENDING_APPROVAL")
                                }
                                if (error?.type === "AccountRejectedError" || errorString.includes("ACCOUNT_REJECTED") || errorString.includes("AccountRejectedError")) {
                                    redirect("/login?error=ACCOUNT_REJECTED")
                                }
                                if (error?.type === "CredentialsSignin" || errorString.includes("CredentialsSignin")) {
                                    redirect("/login?error=CredentialsSignin")
                                }

                                // Re-throw NEXT_REDIRECT or any other successful navigation errors
                                throw error
                            }
                        }}
                        className="w-full space-y-5"
                    >
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
                                    className="w-full p-4 pl-12 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-blue-500 rounded-xl transition-all shadow-sm text-base font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                    placeholder="din@email.dk"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Kodeord</label>
                                <Link href="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">Glemt adgangskode?</Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full p-4 pl-12 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-blue-500 rounded-xl transition-all shadow-sm text-base font-medium placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                    placeholder="******"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button type="submit" className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 dark:bg-black rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                                <div className="absolute inset-0 w-full h-full rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-400 via-teal-400 to-blue-500 blur-lg"></div>
                                <span className="relative z-10 flex items-center gap-2 text-lg">
                                    Log Ind
                                    <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-500" />
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        Har du ikke en bruger? <Link href="/register" className="text-blue-500 hover:text-blue-600 font-bold transition-colors">Opret bruger her</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
