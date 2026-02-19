import { getYearWeeks } from "@/lib/weeks"
import { cn } from "@/lib/utils"

export async function WeekGrid({ year }: { year: number }) {
    const weeks = await getYearWeeks(year)

    // Helper to get color classes based on share color name string (e.g. "bg-red-500")
    // In a real app we might map this more robustly or use CSS variables
    const getColorClass = (color: string | null | undefined) => {
        switch (color) {
            case 'bg-red-500': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30';
            case 'bg-blue-500': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30';
            case 'bg-green-500': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30';
            case 'bg-yellow-500': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30';
            case 'bg-purple-500': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-900/30';
            default: return 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-zinc-800/50 dark:text-gray-400 dark:border-zinc-800';
        }
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {weeks.map((week) => {
                const colorClasses = getColorClass(week.owner?.color);

                return (
                    <div
                        key={week.weekNumber}
                        className={cn(
                            "group relative p-3 rounded-xl border flex flex-col items-center justify-center transition-all hover:shadow-md",
                            colorClasses
                        )}
                    >
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70 mb-1">Uge</span>
                        <span className="text-2xl font-bold tracking-tight">{week.weekNumber}</span>

                        <div className="mt-2 w-full pt-2 border-t border-inherit flex justify-center">
                            <span className="text-xs font-semibold truncate max-w-full px-1">
                                {week.owner?.name || "Ledig"}
                            </span>
                        </div>

                        {/* Optional: Indicator for swap or special status could go here */}
                        {week.source === 'SWAP' && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" title="Byttet uge" />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
