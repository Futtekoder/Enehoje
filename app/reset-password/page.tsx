import { Suspense } from "react"
import { ResetPasswordForm } from "./form"

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <Suspense fallback={<div className="text-gray-500">Indlæser...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
