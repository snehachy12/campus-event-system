"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticipantSidebar } from "@/components/ui/partcipant-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  Bell,
  CalendarDays,
  Lightbulb,
  Music,
  Cpu,
  MapPin,
  Clock,
  Loader2,
  Ticket,
  BrickWall,
  Flame
} from "lucide-react"

/* -------------------- TYPES -------------------- */

interface EventBooking {
  _id: string
  bookingId: string
  eventTitle: string
  eventType: 'workshop' | 'technical' | 'cultural' | 'sports' | 'other'
  eventDate: string
  eventVenue: string
  totalAmount: number
  paymentStatus: string
  bookingStatus: string
}

interface FoodOrder {
  _id: string
  orderId: string
  canteenName: string
  totalAmount: number
  paymentStatus: string
  status: string
  items: any[]
}

/* -------------------- MAIN COMPONENT -------------------- */

export default function ParticipantDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([])
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      fetchDashboardData(user._id || user.id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchDashboardData = async (userId: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const [bookingsRes, ordersRes] = await Promise.all([
        fetch(`/api/event-bookings?studentId=${userId}&limit=20`, { headers }),
        fetch(`/api/orders?customerId=${userId}&limit=5`, { headers })
      ])

      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        setEventBookings(data.bookings || [])
      } else {
        const errorData = await bookingsRes.json()
        console.error('Failed to fetch bookings:', bookingsRes.status, errorData)
        setEventBookings([])
      }
      
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setFoodOrders(data.data || [])
      } else {
        const errorData = await ordersRes.json()
        console.error('Failed to fetch orders:', ordersRes.status, errorData)
        setFoodOrders([])
      }
    } catch (error) {
      console.error("Error loading dashboard:", error)
      setEventBookings([])
      setFoodOrders([])
    } finally {
      setLoading(false)
    }
  }

  const workshops = eventBookings.filter(b => b.eventType === 'workshop')
  const techFests = eventBookings.filter(b => b.eventType === 'technical')
  const culturalFests = eventBookings.filter(b => b.eventType === 'cultural')
  const sports = eventBookings.filter(b => b.eventType === 'sports')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const handleSwitchToOrganizer = () => {
    // Check if user is an approved organizer
    if (currentUser?.role === 'organizer' && (currentUser?.roleRequestStatus === 'approved' || currentUser?.isApproved)) {
      localStorage.setItem("selectedPersona", "organizer")
      window.location.href = "/organizer/dashboard"
    } else {
      alert("You must be an approved organizer to switch to organizer mode")
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <ParticipantSidebar />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur">
          <div className="px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">My Dashboard</h1>
              <p className="text-zinc-400 text-sm">
                Welcome back, <span className="text-[#e78a53] font-medium">{currentUser?.name || 'Student'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {currentUser?.role === 'organizer' && (currentUser?.roleRequestStatus === 'approved' || currentUser?.isApproved) && (
                <Button 
                  onClick={handleSwitchToOrganizer}
                  className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                >
                  Switch to Organizer
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-zinc-400" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Lightbulb className="h-6 w-6 text-yellow-400" />} value={workshops.length} label="Workshops" bgClass="bg-yellow-500/10" />
            <StatCard icon={<Cpu className="h-6 w-6 text-blue-400" />} value={techFests.length} label="Tech Fests" bgClass="bg-blue-500/10" />
            <StatCard icon={<Music className="h-6 w-6 text-pink-400" />} value={culturalFests.length} label="Cultural Fests" bgClass="bg-pink-500/10" />
            <StatCard icon={<BrickWall className="h-6 w-6 text-[#e78a53]" />} value={sports.length} label="Sports" bgClass="bg-[#e78a53]/10" />
          </div>

          {/* REGISTERED WORKSHOPS */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                My Registered Workshops
              </CardTitle>
              <Link href="/participant/workshops">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-yellow-400" /></div>
              ) : workshops.length === 0 ? (
                <EmptyState icon={Lightbulb} message="No workshops registered yet" actionLink="/participant/workshops" actionText="Browse Workshops" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workshops.slice(0, 3).map((w) => (
                    <div key={w._id} className="p-4 bg-zinc-800/40 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all">
                      <h4 className="text-white font-semibold text-sm truncate">{w.eventTitle}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">Workshop</Badge>
                        <span className="text-zinc-500 text-xs">{formatDate(w.eventDate)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-800">
                        <span className="text-zinc-400 text-xs truncate max-w-[100px] flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {w.eventVenue}
                        </span>
                        <Link href={`/ticket/${w._id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">View Ticket <Ticket className="h-3 w-3 ml-1" /></Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* RECENT ACTIVITY & HIGHLIGHTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-zinc-900/50 border-zinc-800 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-blue-400" />
                  Recent Registrations
                </CardTitle>
                <Link href="/participant/events">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">View All</Button>
                </Link>
              </CardHeader>
              <CardContent className="flex-1">
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-400" /></div>
                ) : (
                  <div className="space-y-3">
                    {eventBookings.slice(0, 4).map((booking) => (
                      <div key={booking._id} className="p-3 bg-zinc-800/30 rounded-lg flex justify-between items-center hover:bg-zinc-800/50 transition-colors">
                        <div>
                          <h4 className="text-white font-medium text-sm">{booking.eventTitle}</h4>
                          <span className="text-xs text-zinc-400">{formatDate(booking.eventDate)}</span>
                        </div>
                        <div className="text-right">
                          <Badge className="text-[10px] uppercase">{booking.paymentStatus}</Badge>
                          <p className="text-[#e78a53] text-xs font-medium mt-1">₹{booking.totalAmount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Highlights Card passed as a sub-component */}
            <HighlightsCard loading={loading} highlights={[]} />
          </div>
        </div>
      </main>
    </div>
  )
}

/* -------------------- SUB-COMPONENTS -------------------- */

function HighlightsCard({ highlights = [], loading }: { highlights: any[], loading: boolean }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-orange-400" />
          Don’t Miss This
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" asChild>
          <Link href="/participant/events">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin text-orange-400" /></div>
        ) : highlights.length === 0 ? (
          <EmptyState icon={CalendarDays} message="No upcoming events yet" actionLink="/participant/events" actionText="Explore Events" />
        ) : (
          <div className="space-y-3">
            {highlights.slice(0, 4).map((item: any) => (
              <div key={item.id} className="p-3 bg-zinc-800/30 rounded-lg flex justify-between items-center hover:bg-zinc-800/50 transition-colors">
                <div className="min-w-0 flex-1 mr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium text-sm truncate">{item.title}</h4>
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">{item.type}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 truncate">{item.location} • {item.time}</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-zinc-700 text-zinc-300 shrink-0">{item.cta}</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCard({ icon, value, label, bgClass }: { icon: any, value: any, label: string, bgClass: string }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bgClass}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-zinc-400 text-sm">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, message, actionLink, actionText }: any) {
  return (
    <div className="text-center py-8 flex flex-col items-center justify-center h-full">
      <Icon className="h-10 w-10 text-zinc-700 mb-3" />
      <p className="text-zinc-500 text-sm mb-4">{message}</p>
      <Link href={actionLink}>
        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white">
          {actionText}
        </Button>
      </Link>
    </div>
  )
}