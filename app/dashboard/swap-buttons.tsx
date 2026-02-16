"use client"

import { acceptSwap, rejectSwap } from "./actions"

export function SwapButtons({ swapId }: { swapId: string }) {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => acceptSwap(swapId)}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
                Godkend
            </button>
            <button
                onClick={() => rejectSwap(swapId)}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
                Afvis
            </button>
        </div>
    )
}
