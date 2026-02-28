"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MailCheck } from "lucide-react"
import Link from "next/link"
import { requestPasswordReset } from "./actions"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("loading")

        try {
            const formData = new FormData()
            formData.append("email", email)
            const result = await requestPasswordReset(formData)

            if (result?.error) {
                setStatus("error")
                setErrorMessage(result.error)
            } else {
                setStatus("success")
            }
        } catch (error) {
            setStatus("error")
            setErrorMessage("Der opstod en uventet fejl. Prøv igen senere.")
        }
    }

    if (status === "success") {
        return (
            <div className="flex items-center justify-center min-h-[80vh] px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <MailCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Tjek din indbakke</CardTitle>
                        <CardDescription>
                            Vi har sendt et link til nulstilling af adgangskode til {email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-gray-500">
                        <p className="mb-6">
                            Klik på linket i e-mailen for at oprette en ny adgangskode.
                            Husk at tjekke dit spam-filter hvis du ikke kan finde e-mailen.
                        </p>
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            Tilbage til login
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Glemt Adgangskode</CardTitle>
                    <CardDescription>
                        Indtast din e-mailadresse, så sender vi dig et link til at nulstille din adgangskode.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="din@email.dk"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-zinc-900"
                                required
                            />
                        </div>

                        {status === "error" && (
                            <div className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/10 rounded-md">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading" || !email}
                            className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-600/90 h-10 px-4 py-2"
                        >
                            {status === "loading" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Send Nulstillingslink"
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                Tilbage til login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
