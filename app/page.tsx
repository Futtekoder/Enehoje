import Link from "next/link";
import { ArrowRight, Calendar, MessageSquare, FileText, Vote } from "lucide-react";
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

  const features = [
    {
      title: "Kalender & Bytte",
      description: "Se årsoversigt, hvem der har huset hvornår, og anmod om bytte.",
      icon: <Calendar className="w-6 h-6 text-blue-100" />,
      href: "/calendar",
      color: "bg-blue-600/50 border-blue-400/30",
      hoverColor: "hover:bg-blue-600/80 hover:border-blue-400/60"
    },
    {
      title: "Debat Forum",
      description: "Diskutér med de andre andelshavere, del billeder og idéer.",
      icon: <MessageSquare className="w-6 h-6 text-green-100" />,
      href: "/forum",
      color: "bg-green-600/50 border-green-400/30",
      hoverColor: "hover:bg-green-600/80 hover:border-green-400/60"
    },
    {
      title: "Dokumentarkiv",
      description: "Find vedtægter, referater og husorden samlet ét sted.",
      icon: <FileText className="w-6 h-6 text-purple-100" />,
      href: "/documents",
      color: "bg-purple-600/50 border-purple-400/30",
      hoverColor: "hover:bg-purple-600/80 hover:border-purple-400/60"
    },
    {
      title: "Afstemninger",
      description: "Deltag i beslutninger og se resultater.",
      icon: <Vote className="w-6 h-6 text-orange-100" />,
      href: "/polls",
      color: "bg-orange-600/50 border-orange-400/30",
      hoverColor: "hover:bg-orange-600/80 hover:border-orange-400/60"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* 
        HERO SECTION 
        Replace the bg-gradient class below with your actual image:
        style={{ backgroundImage: "url('/your-island-image.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      */}
      <section
        className="relative flex-1 min-h-screen flex items-center justify-center overflow-hidden bg-blue-900"
        style={{
          backgroundImage: "url('/images/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >

        {/* Overlay to ensure text readability if using an image */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center text-center space-y-8">

          {/* Logo / Badge */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6">
              <span className="text-4xl">🏝️</span>
            </div>
          </div>

          {/* Main Content Area: Side by Side on Desktop */}
          <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

            {/* Left Column: Text & Buttons */}
            <div className="flex-1 space-y-8 text-center flex flex-col items-center lg:items-start lg:text-left animate-fade-in-up delay-100">
              <div className="space-y-4">
                {user ? (
                  <>
                    <h1 className="text-4xl font-black tracking-tighter md:text-5xl lg:text-7xl text-white drop-shadow-lg leading-tight">
                      Velkommen, <br className="hidden lg:block" /><span className="text-teal-300">{user.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="max-w-[600px] text-blue-50 md:text-xl font-medium drop-shadow-md">
                      Du er logget ind som <span className="font-bold text-teal-300">{user.share?.name || "Gæst"}</span>. Vælg en funktion nedenfor for at fortsætte.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-4xl font-black tracking-tighter md:text-5xl lg:text-7xl text-white drop-shadow-lg leading-tight">
                      Velkommen til <br className="hidden lg:block" /><span className="text-teal-300">Enehøje</span>
                    </h1>
                    <p className="max-w-[600px] text-blue-50 md:text-xl font-medium drop-shadow-md">
                      Din digitale foreningsplatform. Log ind for at tilgå kalendere, dokumenter og fælles beslutninger.
                    </p>
                  </>
                )}
              </div>

              {/* Action Buttons or Dashboard Grid depending on Auth */}
              {user ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-8">
                  {features.map((feature) => (
                    <Link
                      key={feature.title}
                      href={feature.href}
                      className={`group flex items-center gap-3 p-4 rounded-xl backdrop-blur-md border border-white/10 ${feature.color} ${feature.hoverColor} transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                    >
                      <div className="p-2 bg-white/10 rounded-lg shrink-0">
                        {feature.icon}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-white text-sm md:text-base">{feature.title}</span>
                        <span className="text-xs text-blue-100/70 line-clamp-1">{feature.description}</span>
                      </div>
                    </Link>
                  ))}
                  {user.role === 'SYSTEM_ADMIN' && (
                    <Link
                      href="/admin"
                      className="group sm:col-span-2 flex items-center justify-center gap-2 p-4 rounded-xl backdrop-blur-md border border-zinc-700/50 bg-zinc-900/60 hover:bg-black/80 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <span className="font-bold text-white text-sm md:text-base">🔐 Gå til Admin Panel</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                  <Link
                    className="flex-1 inline-flex h-14 items-center justify-center rounded-xl bg-white text-blue-900 text-lg font-bold shadow-xl transition-all hover:scale-105 hover:bg-gray-50 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    href="/login"
                  >
                    Log ind
                  </Link>
                  <Link
                    className="flex-1 inline-flex h-14 items-center justify-center rounded-xl bg-blue-600/80 backdrop-blur-md border border-blue-400/50 text-white text-lg font-bold shadow-xl transition-all hover:scale-105 hover:bg-blue-600 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    href="/register"
                  >
                    Opret bruger
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column: Widget */}
            <div className="flex-shrink-0 w-full max-w-md lg:max-w-md animate-fade-in-up delay-200">
              <MarineWidget />
            </div>

          </div>
        </div>

        {/* Footer Link (Less obtrusive) */}
        <div className="absolute bottom-6 w-full text-center z-10">
          <Link href="/legal" className="text-xs text-white/60 hover:text-white hover:underline transition-colors">
            Vedtægter & Husorden
          </Link>
        </div>
      </section>
    </div>
  )
}
