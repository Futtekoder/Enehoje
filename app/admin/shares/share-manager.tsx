"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, ShieldAlert, UserPlus, X, Crown } from "lucide-react"

type Share = {
    id: string
    name: string
    memberships: {
        isChair: boolean
        user: {
            id: string
            name: string | null
            email: string
        }
    }[]
}

type User = {
    id: string
    name: string | null
    email: string
}

export function AdminShareManager({ shares, allUsers }: { shares: Share[], allUsers: User[] }) {
    const router = useRouter()
    const [selectedShare, setSelectedShare] = useState<string | null>(null)
    const [addingUser, setAddingUser] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)

    const handleSetChair = async (shareId: string, userId: string) => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/shares/${shareId}/chair`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            })

            if (!res.ok) throw new Error(await res.text())
            router.refresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddMember = async (shareId: string) => {
        if (!addingUser) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/shares/${shareId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: addingUser })
            })

            if (!res.ok) throw new Error(await res.text())
            setAddingUser("")
            router.refresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemoveMember = async (shareId: string, userId: string, isChair: boolean) => {
        if (isChair) {
            alert("Du kan ikke fjerne en formand. Udpeg en ny formand først.")
            return
        }
        if (!confirm("Er du sikker på du vil fjerne dette medlem fra andelen?")) return

        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/shares/${shareId}/members/${userId}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error(await res.text())
            router.refresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800 font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    Vælg Andel
                </div>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {shares.map(share => {
                        const chair = share.memberships.find(m => m.isChair)
                        return (
                            <div
                                key={share.id}
                                onClick={() => setSelectedShare(share.id)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex justify-between items-center ${selectedShare === share.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : ''
                                    }`}
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{share.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <Crown className="w-3 h-3 text-amber-500" />
                                        {chair ? chair.user.name || chair.user.email : <span className="text-amber-600 italic">Ingen formand valgt</span>}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                    {share.memberships.length} medlemmer
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {selectedShare ? (
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                    {shares.filter(s => s.id === selectedShare).map(share => (
                        <div key={share.id}>
                            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                                <h2 className="font-semibold text-gray-900 dark:text-white">Medlemmer: {share.name}</h2>
                            </div>

                            <div className="p-4 bg-gray-50/50 dark:bg-zinc-800/30 border-b border-gray-100 dark:border-zinc-800 flex gap-2">
                                <select
                                    value={addingUser}
                                    onChange={(e) => setAddingUser(e.target.value)}
                                    className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Tilføj et eksisterende medlem...</option>
                                    {allUsers.filter(u => !share.memberships.find(m => m.user.id === u.id)).map(u => (
                                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => handleAddMember(share.id)}
                                    disabled={!addingUser || isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" /> Tilføj
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {share.memberships.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 italic">Ingen medlemmer i denne andel endnu.</div>
                                ) : (
                                    share.memberships.map(m => (
                                        <div key={m.user.id} className={`p-4 flex items-center justify-between ${m.isChair ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    {m.user.name || "Intet navn"}
                                                    {m.isChair && (
                                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-semibold">
                                                            <Crown className="w-3 h-3" /> Formand
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">{m.user.email}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!m.isChair && (
                                                    <button
                                                        onClick={() => handleSetChair(share.id, m.user.id)}
                                                        disabled={isSaving}
                                                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                        title="Gør til Formand"
                                                    >
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveMember(share.id, m.user.id, m.isChair)}
                                                    disabled={isSaving}
                                                    className={`p-2 rounded-lg transition-colors ${m.isChair
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        }`}
                                                    title={m.isChair ? "Formænd kan ikke fjernes. Udpeg en anden formand først." : "Fjern fra andel"}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700 flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                    <ShieldAlert className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Vælg en andel</h3>
                    <p className="text-gray-500 max-w-sm">Klik på en andel i oversigten til venstre for at administrere medlemmer og udpege formænd.</p>
                </div>
            )}
        </div>
    )
}
