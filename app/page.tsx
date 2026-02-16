
import Link from "next/link";
import { ArrowRight, Shield, Users, Calendar, FileText, Vote } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-black">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center font-bold text-xl tracking-tight text-blue-900 dark:text-blue-100" href="#">
          Enehøje
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="/login">
            Log ind
          </Link>
          <Link className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors" href="/register">
            Opret bruger
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 flex justify-center bg-gradient-to-b from-white to-slate-100 dark:from-black dark:to-zinc-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-blue-950 dark:text-white">
                  Din digitale <span className="text-blue-600">Ø-Forening</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Den komplette platform til ugeplanlægning, debat, dokumentdeling og fælles beslutninger for Enehøje.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  href="/register"
                >
                  Kom i gang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                  href="/login"
                >
                  Log ind
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-black" id="features">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl hover:shadow-lg transition-shadow bg-slate-50 dark:bg-zinc-900/50">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold">Ugeplan & Bytte</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Få overblik over hvem der har huset hvornår. Anmod om bytte og acceptér med ét klik.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl hover:shadow-lg transition-shadow bg-slate-50 dark:bg-zinc-900/50">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold">Debat Forum</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Diskutér stort og småt. Opret tråde, kommentér og upload filer til diskussionen.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl hover:shadow-lg transition-shadow bg-slate-50 dark:bg-zinc-900/50">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Dokumentarkiv</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Altid adgang til vedtægter, husorden og mødereferater. Sikkert og organiseret.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl hover:shadow-lg transition-shadow bg-slate-50 dark:bg-zinc-900/50">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Vote className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold">Afstemninger</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Tag fælles beslutninger demokratisk. Opret afstemninger og se resultaterne live.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl hover:shadow-lg transition-shadow bg-slate-50 dark:bg-zinc-900/50">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Shield className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-bold">Privat & Sikkert</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Kun for medlemmer. Hvert medlem har sin egen konto knyttet til jeres andel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-6 bg-slate-100 dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-800">
          <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2024 Enehøje Ø-Forening. Alle rettigheder forbeholdes.</p>
            <nav className="flex gap-4 sm:gap-6 mt-4 md:mt-0">
              <Link className="hover:underline underline-offset-4" href="/legal">
                Vedtægter & Husorden
              </Link>
              <Link className="hover:underline underline-offset-4" href="#">
                Kontakt Bestyrelsen
              </Link>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  )
}
