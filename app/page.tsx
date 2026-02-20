
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
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

          <div className="space-y-4 max-w-3xl animate-fade-in-up delay-100">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-lg">
              Velkommen til <span className="text-teal-200">Enehøje</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-blue-100 md:text-xl lg:text-2xl font-light drop-shadow-md">
              Din digitale foreningsplatform. Log ind for at tilgå ugeplaner, dokumenter og fælles beslutninger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-fade-in-up delay-200">
            <Link
              className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-white text-blue-900 text-base font-bold shadow-lg transition-transform hover:scale-105 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              href="/login"
            >
              Log ind
            </Link>
            <Link
              className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-blue-600/80 backdrop-blur-sm border border-blue-400/30 text-white text-base font-bold shadow-lg transition-transform hover:scale-105 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              href="/register"
            >
              Opret bruger
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
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
