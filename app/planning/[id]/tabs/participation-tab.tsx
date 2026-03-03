import { useState } from "react"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import { Users, Calendar, MessageSquare, Trash2, Plus } from "lucide-react"

export function ParticipationTab({ event, currentUser, setEvent }: { event: any, currentUser: any, setEvent: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        fromDate: format(new Date(event.startAt), "yyyy-MM-dd"),
        toDate: format(new Date(event.endAt), "yyyy-MM-dd"),
        mode: "ON_ISLAND",
        comment: ""
    })

    const myParticipations = event.participations.filter((p: any) => p.userId === currentUser.id)
    const otherParticipations = event.participations.filter((p: any) => p.userId !== currentUser.id)

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/events/${event.id}/participation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const newP = await res.json()
                // Optimistically link user data for UI
                newP.user = { id: currentUser.id, name: currentUser.name, image: currentUser.image, role: currentUser.role }
                setEvent({ ...event, participations: [...event.participations, newP] })
                setFormData({ ...formData, comment: "" })
            } else {
                alert(await res.text())
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Er du sikker på at afmelde disse dage?")) return
        try {
            const res = await fetch(`/api/events/${event.id}/participation/${id}`, { method: "DELETE" })
            if (res.ok) {
                setEvent({ ...event, participations: event.participations.filter((p: any) => p.id !== id) })
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-6">
                        <Users className="w-5 h-5 mr-2 text-blue-500" /> Tilmeldte Personer
                    </h3>

                    {event.participations.length === 0 ? (
                        <p className="text-gray-500 italic">Ingen tilmeldte endnu.</p>
                    ) : (
                        <div className="space-y-4">
                            {[...myParticipations, ...otherParticipations].map(p => (
                                <div key={p.id} className={`flex items-start justify-between p-4 rounded-xl border ${p.userId === currentUser.id ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20' : 'border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'}`}>
                                    <div className="flex items-start space-x-4">
                                        <img src={p.user?.image || "https://ui-avatars.com/api/?name=" + p.user?.name} className="w-10 h-10 rounded-full" alt="" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {p.user?.name} {p.userId === currentUser.id && <span className="text-blue-600 dark:text-blue-400 text-xs ml-1">(Dig)</span>}
                                            </p>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                                {format(new Date(p.fromDate), "d. MMM", { locale: da })} - {format(new Date(p.toDate), "d. MMM", { locale: da })}
                                            </div>
                                            {p.comment && (
                                                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-gray-400" />
                                                    <span className="italic">"{p.comment}"</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {(p.userId === currentUser.id || currentUser.role === "SYSTEM_ADMIN") && (
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-6">
                        <Plus className="w-5 h-5 mr-2 text-blue-500" /> Tilmeld dig
                    </h3>

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Fra Dato</label>
                                <input type="date" required value={formData.fromDate} onChange={e => setFormData({ ...formData, fromDate: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Til Dato</label>
                                <input type="date" required value={formData.toDate} onChange={e => setFormData({ ...formData, toDate: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Overnatning</label>
                            <select value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="ON_ISLAND">Bor på Øen (Andel)</option>
                                <option value="NOT_ON_ISLAND">Kommer kun om dagen (Bor andetsteds)</option>
                                <option value="MAYBE">Måske kommer forbi</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Kommentar (Valgfrit)</label>
                            <input type="text" placeholder="F.eks. Tager hunden med" value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50">
                            {isSubmitting ? "Tilmelder..." : "Angiv Deltagelse"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
