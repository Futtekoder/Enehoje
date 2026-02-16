export default function LegalPage() {
    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Juridisk Sektion</h1>

            <div className="space-y-6">
                <section className="p-6 border rounded shadow bg-white dark:bg-zinc-900">
                    <h2 className="text-xl font-bold mb-4">Vedtægter</h2>
                    <p>Her kan vedtægterne indskrives eller linkes til et dokument.</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Stk 1. Foreningens navn er Ø-Foreningen.</li>
                        <li>Stk 2. Formålet er at drive øen...</li>
                    </ul>
                </section>

                <section className="p-6 border rounded shadow bg-white dark:bg-zinc-900">
                    <h2 className="text-xl font-bold mb-4">Husorden</h2>
                    <p>Regler for brug af øen.</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Ingen høj musik efter kl 22.</li>
                        <li>Husk at tømme skraldespanden.</li>
                    </ul>
                </section>
            </div>
        </div>
    )
}
