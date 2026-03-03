import { useState, useMemo } from "react"
import { CheckSquare, ArrowUp, Zap, Trash2, CheckCircle2, PlayCircle, Plus } from "lucide-react"

export function TasksTab({ event, currentUser, setEvent }: { event: any, currentUser: any, setEvent: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        category: "PROJECT",
        criticality: "MEDIUM",
        description: ""
    })

    // Check if user has explicit authority to approve tasks
    const canApprove = currentUser.role === "SYSTEM_ADMIN" ||
        (event.scope === "SHARE" && currentUser.memberships?.some((m: any) => m.shareId === event.shareId && m.isChair)) ||
        (event.scope === "MIXED_GROUP" && event.createdByUserId === currentUser.id)

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/events/${event.id}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                const newT = await res.json()
                newT.createdByUser = { name: currentUser.name }
                newT.signups = []
                newT.votes = []
                setEvent({ ...event, tasks: [newT, ...event.tasks] })
                setFormData({ title: "", category: "PROJECT", criticality: "MEDIUM", description: "" })
            }
        } catch (error) { console.error(error) } finally { setIsSubmitting(false) }
    }

    async function handleVote(taskId: string, currentVoteValue: number, newVote: number) {
        // Optimistic UI update could go here
        try {
            const res = await fetch(`/api/tasks/${taskId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vote: newVote })
            })
            if (res.ok) {
                const freshVote = await res.json()
                setEvent({
                    ...event,
                    tasks: event.tasks.map((t: any) => {
                        if (t.id === taskId) {
                            const withoutOld = t.votes.filter((v: any) => v.userId !== currentUser.id)
                            return { ...t, votes: [...withoutOld, freshVote] }
                        }
                        return t
                    })
                })
            }
        } catch (err) { console.error(err) }
    }

    async function handleStatusChange(taskId: string, newStatus: string) {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                setEvent({
                    ...event,
                    tasks: event.tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t)
                })
            }
        } catch (err) { console.error(err) }
    }

    async function handleDelete(taskId: string) {
        if (!confirm("Slet opgave for altid?")) return
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
            if (res.ok) {
                setEvent({ ...event, tasks: event.tasks.filter((t: any) => t.id !== taskId) })
            }
        } catch (err) { console.error(err) }
    }

    const { proposed, approved, active, done } = useMemo(() => {
        const _proposed: any[] = []
        const _approved: any[] = []
        const _active: any[] = []
        const _done: any[] = []

        event.tasks?.forEach((t: any) => {
            if (t.status === "PROPOSED") _proposed.push(t)
            else if (t.status === "APPROVED") _approved.push(t)
            else if (t.status === "ACTIVE") _active.push(t)
            else if (t.status === "DONE") _done.push(t)
        })

        // Sort by votes
        const byVotes = (a: any, b: any) => {
            const scoreA = a.votes.reduce((acc: number, v: any) => acc + v.vote, 0)
            const scoreB = b.votes.reduce((acc: number, v: any) => acc + v.vote, 0)
            return scoreB - scoreA
        }

        return {
            proposed: _proposed.sort(byVotes),
            approved: _approved.sort(byVotes),
            active: _active,
            done: _done
        }
    }, [event.tasks])

    const getCriticalityColor = (crit: string) => {
        switch (crit) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const renderTask = (t: any) => {
        const netScore = t.votes.reduce((acc: number, v: any) => acc + v.vote, 0)
        const myVote = t.votes.find((v: any) => v.userId === currentUser.id)?.vote || 0

        return (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm relative group overflow-hidden">
                <div className="flex absolute right-2 top-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(t.createdByUserId === currentUser.id || canApprove) && (
                        <button onClick={() => handleDelete(t.id)} className="p-1 text-gray-400 hover:text-red-500 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex justify-between items-start mb-2 pr-8">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getCriticalityColor(t.criticality)}`}>
                        {t.criticality}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">{t.category}</span>
                </div>

                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">{t.title}</h4>
                {t.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">{t.description}</p>}

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                    <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 bg-gray-50 dark:bg-gray-900">
                        <button
                            disabled={t.status === "DONE"}
                            onClick={() => handleVote(t.id, myVote, myVote === 1 ? 0 : 1)}
                            className={`p-1.5 rounded-md transition-colors ${myVote === 1 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-4 text-center">{netScore}</span>
                    </div>

                    <div className="flex space-x-1">
                        {canApprove && t.status === "PROPOSED" && (
                            <button onClick={() => handleStatusChange(t.id, "APPROVED")} className="text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 flex items-center rounded dark:bg-emerald-900/30 dark:text-emerald-400">
                                Godkend
                            </button>
                        )}
                        {canApprove && (t.status === "APPROVED" || t.status === "ACTIVE") && (
                            <button onClick={() => handleStatusChange(t.id, t.status === "ACTIVE" ? "DONE" : "ACTIVE")} className="text-[10px] uppercase font-bold tracking-wider bg-gray-900 text-white hover:bg-black px-2 py-1 flex items-center rounded dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                                {t.status === "ACTIVE" ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Udfør</> : <><PlayCircle className="w-3 h-3 mr-1" /> Start</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-2">
                        <Plus className="w-5 h-5 mr-2 text-blue-500" /> Foreslå Opgave
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Har du en god idé til projekt, madplan eller indkøb? Foreslå det her i kanban-boardet forneden, og få det godkendt.
                    </p>

                    <form onSubmit={handleAdd} className="space-y-3">
                        <input required placeholder="Kort overskrift" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500" />
                        <textarea placeholder="Detaljer (valgfrit)" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-blue-500" />

                        <div className="grid grid-cols-2 gap-2">
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-xs focus:ring-blue-500 py-2">
                                <option value="PROJECT">Byggeprojekt</option>
                                <option value="MAINTENANCE">Vedligehold</option>
                                <option value="COOKING">Madlavning</option>
                                <option value="SHOPPING">Indkøb</option>
                                <option value="PACKING">Pakning</option>
                                <option value="OTHER">Andet</option>
                            </select>
                            <select value={formData.criticality} onChange={e => setFormData({ ...formData, criticality: e.target.value })} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-xs focus:ring-blue-500 py-2">
                                <option value="LOW">Lav - Nice to have</option>
                                <option value="MEDIUM">Medium - Bør gøres</option>
                                <option value="HIGH">Høj - Vigtig</option>
                                <option value="CRITICAL">Kritisk</option>
                            </select>
                        </div>
                        <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition-colors text-sm">Tilføj Forslag</button>
                    </form>
                </div>

                {/* KANBAN BOARD */}
                <div className="md:w-2/3 flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                    <div className="min-w-[260px] flex-shrink-0 snap-start">
                        <h4 className="flex items-center text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            <Zap className="w-4 h-4 mr-1 text-orange-400" /> Til Afstemning
                            <span className="ml-2 bg-gray-100 rounded-full px-2 py-0.5 text-[10px]">{proposed.length}</span>
                        </h4>
                        <div className="space-y-3">{proposed.map(renderTask)}</div>
                    </div>

                    <div className="min-w-[260px] flex-shrink-0 snap-start">
                        <h4 className="flex items-center text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            <CheckSquare className="w-4 h-4 mr-1 text-emerald-500" /> Godkendt
                            {canApprove && <span className="ml-2 text-[9px] text-emerald-600 font-normal lowercase">(Du er godkender)</span>}
                        </h4>
                        <div className="space-y-3">{approved.map(renderTask)}</div>
                    </div>

                    <div className="min-w-[260px] flex-shrink-0 snap-start">
                        <h4 className="flex items-center text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            <PlayCircle className="w-4 h-4 mr-1 text-blue-500" /> I Gang
                        </h4>
                        <div className="space-y-3">{active.map(renderTask)}</div>
                    </div>

                    <div className="min-w-[260px] flex-shrink-0 snap-start">
                        <h4 className="flex items-center text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-gray-400" /> Færdig
                        </h4>
                        <div className="space-y-3 opacity-50">{done.map(renderTask)}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
