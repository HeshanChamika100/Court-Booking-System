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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Navigation Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Wijaya Sports Club</h1>
              <p className="text-xs text-muted-foreground">Padukka</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6 text-foreground">
            Book Your Perfect Court Time
          </h2>
          <p className="text-xl text-muted-foreground text-balance mb-8">
            Reserve badminton courts at Wijaya Sports Club with our easy-to-use online booking system. 
            Simple, fast, and convenient.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-card rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CalendarDays className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Flexible Scheduling</h3>
              <p className="text-sm text-muted-foreground">Book courts from 4 PM to 10 PM daily</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <Users className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Multiple Courts</h3>
              <p className="text-sm text-muted-foreground">Book 1-6 courts for your group</p>
            </div>
            <div className="p-6 bg-card rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Secure & Safe</h3>
              <p className="text-sm text-muted-foreground">Your data is protected and secure</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <BookingForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-3">About Us</h3>
              <p className="text-sm text-muted-foreground">
                Wijaya Sports Club is committed to providing excellent badminton facilities and services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Hours</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Monday - Sunday: 4 PM - 10 PM</li>
                <li>Holidays: By appointment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Contact</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Phone: +94 XXXX XXXX</li>
                <li>Email: info@wijayasports.com</li>
                <li>Location: Padukka, Sri Lanka</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Wijaya Sports Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
