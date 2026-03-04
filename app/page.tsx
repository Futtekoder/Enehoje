import Link from "next/link";
import { ArrowRight, Calendar, MessageSquare, Wrench, Ship } from "lucide-react";
import { MarineWidget } from "@/components/marine-widget"
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function LandingPage() {
  const session = await auth();

  // If logged in, fetch user details to display the dashboard alternatives
  let user = null;
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        share: {
          select: { id: true, name: true }
        }
      },
    });
  }

  const masterCards = [
    {
      title: "Kalender & Bytte",
      description: "Se årsoversigt, sejladsuger og opret bytteønsker",
      icon: <Calendar className="w-8 h-8 md:w-10 md:h-10 text-blue-100" />,
      href: "/calendar",
      color: "bg-blue-600/50 border-blue-400/30",
      hoverColor: "hover:bg-blue-600/80 hover:border-blue-400/60 hover:-translate-y-1 hover:shadow-2xl shadow-blue-900/50"
    },
    {
      title: "Planlægning",
      description: "Fælles arbejdsweekender, madplaner og opgaver",
      icon: <Ship className="w-8 h-8 md:w-10 md:h-10 text-emerald-100" />,
      href: "/planning",
      color: "bg-emerald-600/50 border-emerald-400/30",
      hoverColor: "hover:bg-emerald-600/80 hover:border-emerald-400/60 hover:-translate-y-1 hover:shadow-2xl shadow-emerald-900/50"
    },
    {
      title: "Drift & Vejledninger",
      description: "Guide til lukning, fyret, båden, og sikkerhed mod tyveri.",
      icon: <Wrench className="w-8 h-8 md:w-10 md:h-10 text-orange-100" />,
      href: "/drift",
      color: "bg-orange-600/50 border-orange-400/30",
      hoverColor: "hover:bg-orange-600/80 hover:border-orange-400/60 hover:-translate-y-1 hover:shadow-2xl shadow-orange-900/50"
    },
    {
      title: "Forum",
      description: "Diskutér stort og småt med de andre andelshavere",
      icon: <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-purple-100" />,
      href: "/forum",
      color: "bg-purple-600/50 border-purple-400/30",
      hoverColor: "hover:bg-purple-600/80 hover:border-purple-400/60 hover:-translate-y-1 hover:shadow-2xl shadow-purple-900/50"
    }
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] bg-zinc-50 dark:bg-black relative">
      {/* Background elements (Shared) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {!user && (
          <div
            className="absolute inset-0 bg-blue-900"
            style={{
              backgroundImage: "url('/images/hero.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.4
            }}
          />
        )}
        {user && (
          <>
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/40 via-blue-900/10 to-transparent dark:from-blue-900/20 dark:via-blue-900/5 object-cover mix-blend-multiply opacity-50 pointer-events-none"
              style={{ backgroundImage: "url('/images/hero.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="absolute -top-[30%] -right-10 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-[20%] -left-10 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
          </>
        )}
      </div>

      <section className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 lg:p-10">
        <div className="w-full max-w-7xl mx-auto">
          {user ? (
            // ==============================
            // AUTHENTICATED DASHBOARD VIEW
            // ==============================
            <div className="animate-fade-in-up flex flex-col gap-8">
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="text-center lg:text-left space-y-2">
                  <h1 className="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white drop-shadow-sm tracking-tight">
                    Velkommen, <span className="text-blue-600 dark:text-blue-400">{user.name?.split(' ')[0]}</span>
                  </h1>
                  <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 font-medium">
                    Andel: <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 font-bold">{user.share?.name || "Gæst"}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Side: 4 Cards Grid - Smaller formatting */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                  {masterCards.map((card) => (
                    <Link
                      key={card.title}
                      href={card.href}
                      className={`group flex flex-col justify-between p-5 md:p-6 rounded-3xl backdrop-blur-xl border border-white/20 dark:border-zinc-800/80 transition-all shadow-xl ${card.color} ${card.hoverColor}`}
                    >
                      <div className="p-3 lg:p-4 bg-white/10 dark:bg-black/20 rounded-2xl w-fit mb-4 md:mb-6 ring-1 ring-white/20">
                        {card.icon}
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md">{card.title}</h2>
                        <p className="text-sm text-white/85 font-medium leading-snug">{card.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Right Side: Marine Widget (Utility Column) */}
                <div className="w-full lg:w-[400px] shrink-0 xl:w-[450px]">
                  <div className="sticky top-24">
                    <MarineWidget />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ==============================
            // UNAUTHENTICATED LANDING VIEW
            // ==============================
            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 mt-10 lg:mt-20">

              {/* Left Column: Text & Buttons */}
              <div className="flex-1 flex flex-col items-center justify-center lg:items-start lg:text-left space-y-12 animate-fade-in-up">
                {/* Logo / Badge */}
                <div className="inline-flex items-center justify-center p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl">
                  <span className="text-6xl">🏝️</span>
                </div>

                <div className="space-y-6 max-w-2xl">
                  <h1 className="text-5xl font-black tracking-tighter md:text-6xl lg:text-7xl text-white drop-shadow-2xl leading-tight">
                    Velkommen til <br className="hidden lg:block" /><span className="text-blue-300">Enehøje</span>
                  </h1>
                  <p className="text-lg md:text-xl text-blue-50 font-medium drop-shadow-md lg:pr-10">
                    Den digitale foreningsplatform for andelshavere.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <Link
                    className="flex-1 inline-flex h-14 items-center justify-center rounded-2xl bg-white text-blue-900 text-lg font-bold shadow-xl transition-all hover:scale-[1.02] hover:bg-gray-50 focus-visible:outline-none"
                    href="/login"
                  >
                    Log ind
                  </Link>
                  <Link
                    className="flex-1 inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600/80 backdrop-blur-md border border-blue-400/50 text-white text-lg font-bold shadow-xl transition-all hover:scale-[1.02] hover:bg-blue-600 focus-visible:outline-none"
                    href="/register"
                  >
                    Opret bruger
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Marine Widget for Guests */}
              <div className="flex-shrink-0 w-full max-w-md lg:max-w-md animate-fade-in-up delay-200">
                <MarineWidget />
              </div>
            </div>
          )}
        </div>

      </section>
    </div>
  )
}
