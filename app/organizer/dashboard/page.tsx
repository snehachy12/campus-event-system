"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// You might need to rename/create this sidebar for Organizer specific links
import { OrganizerSidebar } from "@/components/organizer-sidebar" 
import { UserMenu } from "@/components/user-menu"
import {
  Bell,
  CalendarDays,
  Users,
  IndianRupee,
  ShoppingBag,
  Plus,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Utensils
} from "lucide-react"
import { useEffect, useState } from "react"

// --- Types ---
interface Organizer {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface Event {
  _id: string
  title: string
  startDate: string
  venue: string
  status: 'published' | 'draft' | 'completed'
  attendeeCount: number // Calculated field from backend
  maxParticipants: number
  revenue: number       // Calculated field from backend
}

interface RecentBooking {
  _id: string
  studentName: string
  eventTitle: string
  totalAmount: number
  status: string
  createdAt: string
}

interface PendingFoodOrder {
  _id: string
  orderId: string
  customerName: string
  itemsCount: number
  totalAmount: number
  status: 'preparing' | 'ready' | 'pending'
}

export default function OrganizerDashboard() {
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [pendingOrders, setPendingOrders] = useState<PendingFoodOrder[]>([])
  
  const [loading, setLoading] = useState(true)

  // 1. Fetch Organizer Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = localStorage.getItem('currentUser')
        if (user) {
           setOrganizer(JSON.parse(user))
        }
        // Ideally fetch fresh data from API:
        // const res = await fetch('/api/organizer/profile')
        // if (res.ok) setOrganizer(await res.json())
      } catch (err) {
        console.error("Error loading profile", err)
      }
    }
    fetchProfile()
  }, [])

  // 2. Fetch Dashboard Data
  useEffect(() => {
    if (organizer?._id) {
      Promise.all([
        fetchMyEvents(),
        fetchRecentBookings(),
        fetchPendingFoodOrders()
      ]).finally(() => setLoading(false))
    }
  }, [organizer])

  const fetchMyEvents = async () => {
    try {
      // API to get events created by this organizer
      const res = await fetch(`/api/events?organizerId=${organizer!._id}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setMyEvents(data.events || [])
      }
    } catch (error) { console.error(error) }
  }

  const fetchRecentBookings = async () => {
    try {
      // API to get recent registrations for MY events
      const res = await fetch(`/api/bookings/organizer?organizerId=${organizer!._id}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setRecentBookings(data.bookings || [])
      }
    } catch (error) { console.error(error) }
  }

  const fetchPendingFoodOrders = async () => {
    try {
      // API to get food orders relevant to this organizer (if they manage canteen)
      const res = await fetch(`/api/orders/pending?organizerId=${organizer!._id}`)
      if (res.ok) {
        const data = await res.json()
        setPendingOrders(data.orders || [])
      }
    } catch (error) { console.error(error) }
  }

  // --- Calculations ---
  const totalRevenue = myEvents.reduce((acc, curr) => acc + (curr.revenue || 0), 0)
  const totalParticipants = myEvents.reduce((acc, curr) => acc + (curr.attendeeCount || 0), 0)

  return (
    <div className="min-h-screen bg-black flex">
      {/* Ensure you have an OrganizerSidebar component similar to StudentSidebar */}
      <OrganizerSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Organizer Dashboard</h1>
                <p className="text-zinc-400">
                  Welcome back, <span className="text-[#e78a53]">{organizer?.firstName || 'Organizer'}</span>!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/organizer/events/create">
                  <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Create Event
                  </Button>
                </Link>
                <div className="h-8 w-px bg-zinc-800 mx-2" />
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          
          {/* 1. Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg"><CalendarDays className="h-6 w-6 text-blue-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? '--' : myEvents.length}</p>
                  <p className="text-zinc-400 text-sm">Active Events</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg"><Users className="h-6 w-6 text-green-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? '--' : totalParticipants}</p>
                  <p className="text-zinc-400 text-sm">Total Participants</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-[#e78a53]/10 rounded-lg"><IndianRupee className="h-6 w-6 text-[#e78a53]" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? '--' : `₹${totalRevenue.toLocaleString()}`}</p>
                  <p className="text-zinc-400 text-sm">Total Revenue</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg"><Utensils className="h-6 w-6 text-purple-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? '--' : pendingOrders.length}</p>
                  <p className="text-zinc-400 text-sm">Pending Food Orders</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 2. My Active Events */}
            <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#e78a53]" />
                  My Events
                </CardTitle>
                <Link href="/organizer/events">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                   <div className="text-center py-8 text-zinc-500">Loading...</div>
                ) : myEvents.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900/30 rounded-lg border border-dashed border-zinc-800">
                    <p className="text-zinc-400 mb-4">You haven't created any events yet.</p>
                    <Link href="/organizer/events/create">
                      <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                        <Plus className="h-4 w-4 mr-2" /> Create First Event
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myEvents.map((event) => (
                      <div key={event._id} className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                             <h4 className="text-white font-medium text-lg">{event.title}</h4>
                             <div className="flex items-center gap-3 text-zinc-400 text-xs mt-1">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(event.startDate).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {event.venue}</span>
                             </div>
                           </div>
                           <Badge variant="outline" className={
                             event.status === 'published' ? 'text-green-400 border-green-500/30' : 'text-zinc-400'
                           }>
                             {event.status}
                           </Badge>
                        </div>
                        
                        {/* Progress Bar for Participants */}
                        <div className="mt-4">
                           <div className="flex justify-between text-xs text-zinc-400 mb-1">
                              <span>Participants</span>
                              <span>{event.attendeeCount} / {event.maxParticipants}</span>
                           </div>
                           <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#e78a53]" 
                                style={{ width: `${(event.attendeeCount / event.maxParticipants) * 100}%` }}
                              />
                           </div>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                           <Link href={`/organizer/events/${event._id}/participants`} className="flex-1">
                             <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                               Manage Participants
                             </Button>
                           </Link>
                           <Link href={`/organizer/events/${event._id}/edit`} className="flex-1">
                             <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                               Edit Details
                             </Button>
                           </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Right Column: Recent Bookings & Food */}
            <div className="space-y-6">
              
              {/* Recent Bookings (Incoming) */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Recent Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   {recentBookings.length === 0 ? (
                      <p className="text-zinc-500 text-xs text-center">No new registrations</p>
                   ) : recentBookings.map(booking => (
                      <div key={booking._id} className="flex justify-between items-center p-2 rounded hover:bg-zinc-800/50">
                         <div>
                            <p className="text-white text-sm font-medium">{booking.studentName}</p>
                            <p className="text-zinc-500 text-xs truncate w-32">{booking.eventTitle}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[#e78a53] text-sm">+₹{booking.totalAmount}</p>
                            <p className="text-zinc-500 text-[10px]">{new Date(booking.createdAt).toLocaleTimeString()}</p>
                         </div>
                      </div>
                   ))}
                </CardContent>
              </Card>

              {/* Pending Food Orders (Operational) */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <ShoppingBag className="h-4 w-4 text-yellow-400" />
                    Kitchen Queue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   {pendingOrders.length === 0 ? (
                      <p className="text-zinc-500 text-xs text-center">All orders processed</p>
                   ) : pendingOrders.map(order => (
                      <div key={order._id} className="flex justify-between items-center p-2 bg-zinc-800/30 rounded border border-zinc-800">
                         <div>
                            <p className="text-white text-sm font-medium">Order #{order.orderId}</p>
                            <p className="text-zinc-500 text-xs">{order.itemsCount} items • {order.customerName}</p>
                         </div>
                         <Button size="sm" className="h-7 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                           Process
                         </Button>
                      </div>
                   ))}
                   <Link href="/organizer/food/orders">
                     <Button variant="link" className="w-full text-xs text-zinc-400 h-auto p-0 mt-2">View All Orders</Button>
                   </Link>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}