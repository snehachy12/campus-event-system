"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticipantSidebar } from "@/components/ui/participant-sidebar"
import { UserMenu } from "@/components/user-menu"

import {
  Bell,
  CalendarDays,
  Briefcase,
  IndianRupee,
  ShoppingBag,
  MapPin,
  Clock,
  Building
} from "lucide-react"

/* -------------------- TYPES -------------------- */

interface Participant {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface EventBooking {
  _id: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  totalAmount: number
  paymentStatus: string
  bookingStatus: string
}

interface FoodOrder {
  _id: string
  canteenName: string
  totalAmount: number
  paymentStatus: string
  status: string
  items: any[]
}

interface InternshipApplication {
  _id: string
  internshipId: {
    title: string
    company: string
    location: string
  }
  applicationStatus: string
}

/* -------------------- COMPONENT -------------------- */

export default function ParticipantDashboard() {
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([])
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
  const [internshipApplications, setInternshipApplications] = useState<InternshipApplication[]>([])
  const [loading, setLoading] = useState(true)

  /* -------------------- FETCH PROFILE -------------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/participant/profile")
      if (res.ok) setParticipant(await res.json())
    }
    fetchProfile()
  }, [])

  /* -------------------- FETCH DASHBOARD DATA -------------------- */
  useEffect(() => {
    if (!participant?._id) return

    Promise.all([
      fetch(`/api/bookings?studentId=${participant._id}`).then(r => r.json()),
      fetch(`/api/orders?studentId=${participant._id}`).then(r => r.json()),
      fetch(`/api/internships/applications?studentId=${participant._id}`).then(r => r.json())
    ])
      .then(([bookings, orders, internships]) => {
        setEventBookings(bookings.bookings || [])
        setFoodOrders(orders.orders || [])
        setInternshipApplications(internships.applications || [])
      })
      .finally(() => setLoading(false))
  }, [participant])

  /* -------------------- DERIVED DATA -------------------- */

  const upcomingEvent = eventBookings
    .filter(e => new Date(e.eventDate) > new Date())
    .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate))[0]

  const totalSpent =
    eventBookings.filter(e => e.paymentStatus === "paid").reduce((s, e) => s + e.totalAmount, 0) +
    foodOrders.filter(f => f.paymentStatus === "paid").reduce((s, f) => s + f.totalAmount, 0)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-black flex">
      <ParticipantSidebar />

      <main className="flex-1 overflow-auto">
        {/* HEADER */}
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
              <p className="text-zinc-400">
                Welcome back,{" "}
                <span className="text-[#e78a53]">{participant?.firstName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-zinc-400" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">

          {/* UPCOMING EVENT */}
          <Card className="border-zinc-800 bg-gradient-to-r from-[#e78a53]/10 to-zinc-900">
            <CardContent className="p-6">
              {upcomingEvent ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Upcoming Event</p>
                    <h3 className="text-lg font-semibold text-white">
                      {upcomingEvent.eventTitle}
                    </h3>
                    <div className="flex gap-4 mt-2 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(upcomingEvent.eventDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {upcomingEvent.eventVenue}
                      </span>
                    </div>
                  </div>
                  <Link href={`/ticket?id=${upcomingEvent._id}`}>
                    <Button>Open Pass</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Upcoming Event</p>
                    <h3 className="text-white">No upcoming events</h3>
                    <p className="text-sm text-zinc-500">
                      Explore events happening on campus.
                    </p>
                  </div>
                  <Link href="/participant/events">
                    <Button>Browse Events</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<CalendarDays />} value={eventBookings.length} label="Events Joined" />
            <StatCard icon={<Briefcase />} value={internshipApplications.length} label="Internship Applications" />
            <StatCard icon={<ShoppingBag />} value={foodOrders.length} label="Food Orders" />
            <StatCard icon={<IndianRupee />} value={`₹${totalSpent}`} label="Total Spent" />
          </div>

          {/* INTERNSHIPS */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#e78a53]" />
                Active Internship Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {internshipApplications.length === 0 ? (
                <p className="text-zinc-400 text-center py-6">
                  You haven’t applied to any internships yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {internshipApplications.map(app => (
                    <div key={app._id} className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                      <h4 className="text-white font-medium">
                        {app.internshipId.title}
                      </h4>
                      <div className="text-xs text-zinc-400 mt-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {app.internshipId.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {app.internshipId.location}
                        </div>
                      </div>
                      <Badge className="mt-3">
                        {app.applicationStatus.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

/* -------------------- SMALL COMPONENT -------------------- */

function StatCard({
  icon,
  value,
  label
}: {
  icon: React.ReactNode
  value: number | string
  label: string
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-lg text-[#e78a53]">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-zinc-400 text-sm">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
