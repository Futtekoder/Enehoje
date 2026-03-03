import { ImageIcon } from "lucide-react";

export default function GalleryPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/40 dark:border-zinc-800/60 max-w-lg w-full text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 mb-2">
                    <ImageIcon size={40} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Galleri</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    Dette modul er under udvikling. Her vil andelshaverne kunne samle og dele billeder (Memory Lane) fra ferier og arbejdsweekender.
                </p>
                <div className="pt-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-sm font-bold shadow-sm">
                        🚧 Kommer senere
                    </span>
                </div>
            </div>
        </div>
    );
}
