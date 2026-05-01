import { BookingForm } from '@/components/booking-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarDays, Users, Trophy, Shield } from 'lucide-react'

export const metadata = {
  title: 'Book Your Court - Wijaya Sports Club',
  description: 'Book badminton courts at Wijaya Sports Club, Padukka. Easy online booking system.',
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/badminton-wallpaper.jpg')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_28%),linear-gradient(135deg,rgba(4,7,14,0.86),rgba(4,7,14,0.62),rgba(4,7,14,0.88))]" />
      <div className="relative z-10 flex flex-col grow">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">Wijaya Sports Club</h1>
                <p className="text-xs text-white/65">Padukka</p>
              </div>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-white/20 bg-white/90 text-slate-950 hover:bg-white">
                <Shield className="mr-2 h-4 w-4" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <section className="max-w-2xl pt-0 md:pt-4 lg:sticky lg:top-28">
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight text-white">
                Book badminton courts without the clutter.
              </h2>
              <p className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg leading-6 md:leading-7 text-white/78">
                Reserve your slot at Wijaya Sports Club with a clean, fast booking flow and live court availability.
              </p>

              <div className="mt-6 md:mt-8 grid gap-3 grid-cols-2 sm:grid-cols-3">
                <div className="rounded-xl md:rounded-2xl border border-white/12 bg-black/28 p-3 md:p-4 backdrop-blur-md">
                  <CalendarDays className="mb-2 md:mb-3 h-4 md:h-5 w-4 md:w-5 text-emerald-300" />
                  <p className="text-xs md:text-sm font-semibold text-white">Flexible</p>
                  <p className="mt-1 text-xs leading-4 text-white/68">Pick any date from today onward.</p>
                </div>
                <div className="rounded-xl md:rounded-2xl border border-white/12 bg-black/28 p-3 md:p-4 backdrop-blur-md">
                  <Users className="mb-2 md:mb-3 h-4 md:h-5 w-4 md:w-5 text-sky-300" />
                  <p className="text-xs md:text-sm font-semibold text-white">Group ready</p>
                  <p className="mt-1 text-xs leading-4 text-white/68">Reserve multiple courts in one request.</p>
                </div>
                <div className="rounded-xl md:rounded-2xl border border-white/12 bg-black/28 p-3 md:p-4 backdrop-blur-md">
                  <Shield className="mb-2 md:mb-3 h-4 md:h-5 w-4 md:w-5 text-amber-300" />
                  <p className="text-xs md:text-sm font-semibold text-white">Reliable</p>
                  <p className="mt-1 text-xs leading-4 text-white/68">Availability updates before you submit.</p>
                </div>
              </div>
            </section>

            <section className="lg:pt-2 lg:pl-4">
              <BookingForm />
            </section>
          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/25 py-8 backdrop-blur-xl mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-3 mb-6">
              <div>
                <p className="font-semibold text-white">Wijaya Sports Club</p>
                <p className="text-sm text-white/70">Padukka, Sri Lanka</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Contact</p>
                <p className="text-sm text-white/85">
                  <span className="text-white">Phone:</span> +94 71 234 5678
                </p>
                <p className="text-sm text-white/85">
                  <span className="text-white">Email:</span> info@wijayasports.com
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">Hours</p>
                <p className="text-sm text-white/85">Mon - Sun: 4 PM - 10 PM</p>
                <p className="text-sm text-white/85">Holidays: By appointment</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 text-center text-xs text-white/60">
              <p>&copy; {new Date().getFullYear()} Wijaya Sports Club. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
