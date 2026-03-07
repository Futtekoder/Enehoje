import { format } from "date-fns"
import { da } from "date-fns/locale"
import { Clock, Info, Shield, User as UserIcon, Trash2, MessageSquare } from "lucide-react"
import Link from "next/link"

export function OverviewTab({ event, currentUser, setEvent }: { event: any, currentUser: any, setEvent: any }) {
    const canDelete = currentUser.id === event.createdByUserId || currentUser.role === "SYSTEM_ADMIN"

    const handleDeleteEvent = async () => {
        if (!confirm("Er du sikker på at du vil slette dette arrangement? Dette kan ikke fortrydes, og alle tilmeldinger og opgaver vil gå tabt.")) return

        try {
            const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" })
            if (res.ok) {
                window.location.href = "/planning"
            } else {
                alert("Der skete en fejl ved sletning af arrangementet.")
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Info className="w-5 h-5 mr-2 text-blue-500" /> Detaljer
                    </h3>

                    {canDelete && (
                        <button
                            onClick={handleDeleteEvent}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
                            title="Slet arrangement"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Slet</span>
                        </button>
                    )}
                </div>

                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-6">
                    {event.description ? (
                        <p className="whitespace-pre-wrap">{event.description}</p>
                    ) : (
                        <p className="italic text-gray-400">Ingen beskrivelse tilføjet for denne begivenhed endnu.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                    <div className="flex items-start">
                        <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Varighed</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Fra: {format(new Date(event.startAt), "EEEE d. MMM yyyy 'kl.' HH:mm", { locale: da })}<br />
                                Til: {format(new Date(event.endAt), "EEEE d. MMM yyyy 'kl.' HH:mm", { locale: da })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Oprettet af</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                {event.createdByUser?.image && (
                                    <img src={event.createdByUser.image} className="w-5 h-5 rounded-full mr-2" alt="" />
                                )}
                                {event.createdByUser?.name || "Ukendt"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 p-6 flex items-start">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-4 flex-shrink-0" />
                <div>
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300">Begivenheds-Scope: {event.scope}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        Dette er en begivenhed arrangeret af {event.scope === "SHARE" ? `Andel: ${event.share?.name}` : "Øen generelt"}.
                        Gå til "Deltagelse" fanen for at tilmelde dig dagene.
                    </p>
                </div>
            </div>

            {/* DISCUSSION CARD */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-blue-500" /> Diskussion
                    </h3>
                </div>

                {event.forumThreadId ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Der er en relateret diskussion i forum.
                        </p>
                        <Link
                            href={`/forum/${event.forumThreadId}`}
                            className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 border border-blue-200 dark:border-blue-800 text-sm font-medium rounded-xl text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Åbn diskussion
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ingen diskussion endnu.
                        </p>
                        <form action={async () => {
                            try {
                                const { createLinkedDiscussion } = await import('../actions')
                                await createLinkedDiscussion(event.id)
                            } catch (e) {
                                console.error(e)
                                alert("Der skete en fejl. Prøv igen.")
                            }
                        }}>
                            <button
                                type="submit"
                                className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Start diskussion
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
