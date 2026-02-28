import { signIn, auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function LoginPage() {
    const session = await auth()
    if (session?.user) {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded shadow p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Log Ind</h1>

                <form
                    action={async (formData) => {
                        "use server"
                        await signIn("credentials", formData, { redirectTo: "/dashboard" })
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
