"use client"

import { useState } from "react"
import { X, Calendar as CalendarIcon } from "lucide-react"

export function CreateEventModal({ isOpen, onClose, userRole, userShares, onEventCreated }: { isOpen: boolean, onClose: () => void, userRole: string, userShares: any[], onEventCreated: (event: any) => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "WORK_WEEKEND",
        scope: "ALL_MEMBERS",
        startAt: "",
        endAt: "",
        shareId: "" // Only used if scope is SHARE
    })

    if (!isOpen) return null

    // Determine allowed scopes based on user role
    const canCreateAllMembers = userRole === "SYSTEM_ADMIN" || userRole === "ANDEL_ADMIN"
    const hasShares = userShares.length > 0

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const newEvent = await res.json()
                onEventCreated(newEvent)
                onClose()
            } else {
                alert(await res.text())
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-gray-100">
                        <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Opret Arrangement
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Titel</label>
                            <input required type="text" placeholder="F.eks. Forårs-klargøring" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Beskrivelse (valgfrit)</label>
                            <textarea rows={3} placeholder="Hvad skal der ske?" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all text-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fra</label>
                                <input required type="datetime-local" value={formData.startAt} onChange={e => setFormData({ ...formData, startAt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Til</label>
                                <input required type="datetime-local" value={formData.endAt} onChange={e => setFormData({ ...formData, endAt: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all text-sm">
                                    <option value="WORK_WEEKEND">Arbejdsweekend</option>
                                    <option value="COMMON_WEEKEND">Fællesweekend</option>
                                    <option value="SHARE_STAY">Andels-ophold</option>
                                    <option value="OTHER">Andet</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Hvem er det for?</label>
                                <select value={formData.scope} onChange={e => setFormData({ ...formData, scope: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all text-sm">
                                    {canCreateAllMembers && <option value="ALL_MEMBERS">Hele Øen (Alle)</option>}
                                    {hasShares && <option value="SHARE">Min Andel</option>}
                                    <option value="MIXED_GROUP">Lille Gruppe (Inviteret)</option>
                                </select>
                            </div>
                        </div>

                        {formData.scope === "SHARE" && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Vælg Andel</label>
                                <select required value={formData.shareId} onChange={e => setFormData({ ...formData, shareId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all text-sm">
                                    <option value="" disabled>Vælg en andel...</option>
                                    {userShares.map(share => (
                                        <option key={share.id} value={share.id}>{share.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                                Annuller
                            </button>
                            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center">
                                {isSubmitting ? "Opretter..." : "Opret Arrangement"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
