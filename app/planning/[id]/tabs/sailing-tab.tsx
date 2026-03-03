import { useState } from "react"
import { format } from "date-fns"
import { da } from "date-fns/locale"
import { Anchor, Compass, Clock, Trash2, Plus, Ship } from "lucide-react"

export function SailingTab({ event, currentUser, setEvent }: { event: any, currentUser: any, setEvent: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        direction: "ARRIVAL",
        desiredAt: format(new Date(), "yyyy-MM-dd'T'12:00"),
        timeFlexibility: "FLEX_1H",
        fromLocation: "LANGOE_HAVN",
        seats: 1,
        notes: ""
    })

    const arrivals = event.sailingWishes.filter((w: any) => w.direction === "ARRIVAL")
    const departures = event.sailingWishes.filter((w: any) => w.direction === "DEPARTURE")

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/events/${event.id}/sailing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const newW = await res.json()
                newW.user = { id: currentUser.id, name: currentUser.name, image: currentUser.image }
                setEvent({ ...event, sailingWishes: [...event.sailingWishes, newW].sort((a, b) => new Date(a.desiredAt).getTime() - new Date(b.desiredAt).getTime()) })
                setFormData({ ...formData, notes: "" })
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
        if (!confirm("Fjern dette sejlads-ønske?")) return
        try {
            const res = await fetch(`/api/events/${event.id}/sailing/${id}`, { method: "DELETE" })
            if (res.ok) {
                setEvent({ ...event, sailingWishes: event.sailingWishes.filter((w: any) => w.id !== id) })
            }
        } catch (error) {
            console.error(error)
        }
    }

    const renderWishCard = (w: any) => (
        <div key={w.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between group">
            <div className="flex items-start">
                <img src={w.user?.image || "https://ui-avatars.com/api/?name=" + w.user?.name} className="w-8 h-8 rounded-full mr-3" alt="" />
                <div>
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{w.user?.name}</span>
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{w.seats} Pers</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" /> {format(new Date(w.desiredAt), "EEEE d. MMM HH:mm", { locale: da })}
                    </div>
                    <div className="text-xs text-blue-500 mt-0.5">
                        {w.timeFlexibility === "FIXED" ? "Låst tidspunkt" :
                            w.timeFlexibility === "FLEX_1H" ? "+/- 1 time" :
                                w.timeFlexibility === "FLEX_3H" ? "+/- 3 timer" : "Hele dagen"}
                    </div>
                    {w.notes && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic bg-gray-50 dark:bg-gray-900/50 p-2 rounded">"{w.notes}"</p>}
                </div>
            </div>
            {(w.userId === currentUser.id || currentUser.role === "SYSTEM_ADMIN") && (
                <button onClick={() => handleDelete(w.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded dark:hover:bg-red-900/20 transition-all">
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ARRIVAL List */}
                <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                        <Anchor className="w-4 h-4 mr-2 text-emerald-500" /> Ankomst fra Langø
                    </h3>
                    {arrivals.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Ingen ankomster registreret.</p>
                    ) : (
                        <div className="space-y-3">{arrivals.map(renderWishCard)}</div>
                    )}
                </div>

                {/* DEPARTURE List */}
                <div className="space-y-4">
                    <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                        <Compass className="w-4 h-4 mr-2 text-orange-500" /> Afrejse fra Enehøje
                    </h3>
                    {departures.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Ingen afrejser registreret.</p>
                    ) : (
                        <div className="space-y-3">{departures.map(renderWishCard)}</div>
                    )}
                </div>
            </div>

            {/* Sailing Request Form Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-6">
                    <Ship className="w-5 h-5 mr-2 text-blue-500" /> Bådønske
                </h3>

                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                        <button type="button" onClick={() => setFormData({ ...formData, direction: "ARRIVAL" })} className={`py-1.5 text-sm font-medium rounded-lg transition-colors ${formData.direction === "ARRIVAL" ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700"}`}>Ankomst</button>
                        <button type="button" onClick={() => setFormData({ ...formData, direction: "DEPARTURE" })} className={`py-1.5 text-sm font-medium rounded-lg transition-colors ${formData.direction === "DEPARTURE" ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700"}`}>Afrejse</button>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Dato og Tid (Ca.)</label>
                        <input type="datetime-local" required value={formData.desiredAt} onChange={e => setFormData({ ...formData, desiredAt: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Fleksibilitet</label>
                            <select value={formData.timeFlexibility} onChange={e => setFormData({ ...formData, timeFlexibility: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="FIXED">Låst tid</option>
                                <option value="FLEX_1H">+/- 1 time</option>
                                <option value="FLEX_3H">+/- 3 timer</option>
                                <option value="FLEX_SAME_DAY">Hele dagen</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Antal Personer</label>
                            <input type="number" min="1" max="12" required value={formData.seats} onChange={e => setFormData({ ...formData, seats: parseInt(e.target.value) })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Bemærkning (Valgfrit)</label>
                        <input type="text" placeholder="F.eks. Tager stor bagage med" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors mt-2 disabled:opacity-50">
                        {isSubmitting ? "Gemmer..." : "Tilføj Bådønske"}
                    </button>
                </form>
            </div>
        </div>
    )
}
