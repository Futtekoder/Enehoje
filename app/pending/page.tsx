import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default function PendingPage() {
    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-amber-100 p-3">
                            <ShieldAlert className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Konto Afventer Godkendelse</CardTitle>
                    <CardDescription>
                        Din konto er oprettet, men afventer godkendelse fra en administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground pt-4">
                    <p>
                        Dette er en sikkerhedsforanstaltning for at sikre, at kun beboere på
                        Enehøje har adgang til platformen.
                    </p>
                    <p className="mt-4">
                        Vi bestræber os på at godkende nye brugere hurtigst muligt. Du kan
                        prøve at genindlæse siden senere, eller logge ind igen.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
