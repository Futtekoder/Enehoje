import { signIn, auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded shadow p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Log Ind</h1>

                {searchParams?.error === "PENDING_APPROVAL" && (
                    <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200">
                        Din konto afventer godkendelse fra en administrator. Du vil modtage en e-mail når du kan logge ind.
                    </div>
                )}
                {searchParams?.error === "ACCOUNT_REJECTED" && (
                    <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-200">
                        Din konto er desværre blevet afvist af en administrator.
                    </div>
                )}
                {searchParams?.error === "CredentialsSignin" && (
                    <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-200">
                        Forkert email eller adgangskode. Prøv venligst igen.
                    </div>
                )}

                <form
                    action={async (formData) => {
                        "use server"
                        try {
                            await signIn("credentials", { ...Object.fromEntries(formData), redirect: false })
                        } catch (error: any) {
                            if (error?.type === "PendingApprovalError" || error?.message?.includes("PENDING_APPROVAL")) {
                                redirect("/login?error=PENDING_APPROVAL")
                            }
                            if (error?.type === "AccountRejectedError" || error?.message?.includes("ACCOUNT_REJECTED")) {
                                redirect("/login?error=ACCOUNT_REJECTED")
                            }
                            if (error?.type === "CredentialsSignin") {
                                redirect("/login?error=CredentialsSignin")
                            }
                            throw error
                        }
                        redirect("/dashboard")
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" name="email" required className="w-full p-2 border rounded" placeholder="din@email.dk" />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium">Kodeord</label>
                            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Glemt adgangskode?</Link>
                        </div>
                        <input type="password" name="password" required className="w-full p-2 border rounded" placeholder="******" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium">
                        Log Ind
                    </button>
                </form>

                <div className="mt-4 text-center text-sm">
                    Har du ikke en bruger? <Link href="/register" className="text-blue-600 hover:underline">Opret bruger her</Link>
                </div>
            </div>
        </div>
    )
}
