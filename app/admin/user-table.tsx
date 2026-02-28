
"use client"

import { useState } from "react"
import { toggleAdminRole, deleteUser, updateUserShare, updateUserStatus } from "./actions"
import { Shield, Trash2, Edit2, Check, X, Clock } from "lucide-react"

type User = {
    id: string
    name: string | null
    email: string
    role: string
    status: string
    shareId: string | null
    createdAt: Date
    share: { name: string } | null
}

type Share = {
    id: string
    name: string
}

export function AdminUserTable({ users, shares }: { users: User[], shares: Share[] }) {
    const [editingUser, setEditingUser] = useState<string | null>(null)

    const handleShareChange = async (userId: string, shareId: string) => {
        await updateUserShare(userId, shareId)
        setEditingUser(null)
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Navn / Email</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Andel</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Rolle</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Oprettet</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">Handlinger</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{user.name || "Intet navn"}</div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingUser === user.id ? (
                                        <select
                                            defaultValue={user.shareId || ""}
                                            onChange={(e) => handleShareChange(user.id, e.target.value)}
                                            onBlur={() => setEditingUser(null)}
                                            autoFocus
                                            className="p-1 border rounded text-sm bg-white dark:bg-zinc-800"
                                        >
                                            <option value="">Ingen</option>
                                            {shares.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div onClick={() => setEditingUser(user.id)} className="cursor-pointer hover:underline decoration-dashed underline-offset-4 flex items-center gap-1">
                                            {user.share?.name || <span className="text-gray-400 italic">Ingen</span>}
                                            <Edit2 className="w-3 h-3 text-gray-300 ml-1" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'SYSTEM_ADMIN'
                                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-900/30"
                                        : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-zinc-700"
                                        }`}>
                                        {user.role === 'SYSTEM_ADMIN' ? 'Administrator' : 'Medlem'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.status === 'PENDING' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                                            Afventer
                                        </span>
                                    )}
                                    {user.status === 'APPROVED' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                                            Godkendt
                                        </span>
                                    )}
                                    {user.status === 'REJECTED' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                                            Afvist
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString('da-DK')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {user.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => updateUserStatus(user.id, 'APPROVED')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Godkend Bruger"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Sikker på at du vil afvise denne bruger?")) updateUserStatus(user.id, 'REJECTED')
                                                    }}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Afvis Bruger"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => toggleAdminRole(user.id, user.role)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                            title={user.role === 'SYSTEM_ADMIN' ? "Fjern Admin" : "Gør til Admin"}
                                        >
                                            <Shield className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Er du sikker på du vil slette denne bruger?")) deleteUser(user.id)
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Slet Bruger"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
