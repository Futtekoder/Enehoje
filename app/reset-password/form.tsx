"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { submitNewPassword } from "./actions"

export function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState("")

    if (!token) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-red-600">Ugyldigt link</CardTitle>
                    <CardDescription>
                        Nulstillingslinket mangler en token. Prøv venligst at anmode om et nyt link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/forgot-password" className="text-blue-600 hover:underline">
                        Gå til Glemt Adgangskode
                    </Link>
                </CardContent>
            </Card>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setStatus("error")
            setErrorMessage("Adgangskoderne stemmer ikke overens.")
            return
        }

        if (password.length < 6) {
            setStatus("error")
            setErrorMessage("Adgangskoden skal være mindst 6 tegn lang.")
            return
        }

        setStatus("loading")

        try {
            const formData = new FormData()
            formData.append("token", token)
            formData.append("password", password)

            const result = await submitNewPassword(formData)

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
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Adgangskode Nulstillet</CardTitle>
                    <CardDescription>
                        Din adgangskode blev succesfuldt ændret. Du kan nu logge ind med den nye kode.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 h-10 px-4 py-2 mt-4"
                    >
                        Log ind nu
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-5 h-5 text-gray-500" />
                    <CardTitle className="text-2xl">Ny Adgangskode</CardTitle>
                </div>
                <CardDescription>
                    Opret en ny, stærk adgangskode til din konto.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ny Adgangskode</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-700 dark:bg-zinc-900"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bekræft Ny Adgangskode</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-700 dark:bg-zinc-900"
                            required
                            minLength={6}
                        />
                    </div>

                    {status === "error" && (
                        <div className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/10 rounded-md">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading" || !password || !confirmPassword}
                        className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 h-10"
                    >
                        {status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gem Ny Adgangskode"}
                    </button>
                </form>
            </CardContent>
        </Card>
    )
}
