"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticipantSidebar} from "@/components/ui/participant-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  Bell,
  CalendarDays,
  Briefcase,
  IndianRupee,
  Receipt,
  ShoppingBag,
  MapPin,
  Calendar,
  Building,
  Clock
} from "lucide-react"
import { useEffect, useState } from "react"

// --- Types ---
interface Participant {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface EventBooking {
  _id: string
  bookingId: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  totalAmount: number
  paymentStatus: string
  bookingStatus: string
  razorpayPaymentId?: string
  createdAt: string
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

interface InternshipApplication {
  _id: string
  internshipId: {
    _id: string
    title: string
    company: string
    location: string
    duration: string
    stipend?: string
  }
  applicationStatus: string
  appliedAt: string
}

export default function ParticipantDashboard() {
  const [participant, setParticipant] = useState<Participant | null>(null)
  
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([])
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
  const [internshipApplications, setInternshipApplications] = useState<InternshipApplication[]>([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Fetch Current Participant Profile
    const fetchProfile = async () => {
      try {
        // Replace with your actual auth/profile endpoint
        const res = await fetch('/api/participant/profile') 
        if (res.ok) {
          const data = await res.json()
          setParticipant(data)
        }
      } catch (err) {
        console.error("Error loading profile", err)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    // 2. Fetch Data once Participant ID is known
    if (participant?._id) {
      Promise.all([
        fetchEventBookings(),
        fetchFoodOrders(),
        fetchInternshipApplications()
      ]).finally(() => setLoading(false))
    }
  }, [participant])

  const fetchEventBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?studentId=${participant!._id}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setEventBookings(data.bookings || [])
      }
    } catch (error) { console.error(error) }
  }

  const fetchFoodOrders = async () => {
    try {
      // Assuming you have an orders API
      const response = await fetch(`/api/orders?studentId=${participant!._id}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setFoodOrders(data.orders || [])
      }
    } catch (error) { console.error(error) }
  }
  
  const fetchInternshipApplications = async () => {
    try {
      // Assuming you have an applications API
      const response = await fetch(`/api/internships/applications?studentId=${participant!._id}`)
      if (response.ok) {
        const data = await response.json()
        setInternshipApplications(data.applications || [])
      }
    } catch (error) { console.error(error) }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  // Calculate Totals
  const totalSpent = [...eventBookings, ...foodOrders]
    .filter(i => i.paymentStatus === 'paid')
    .reduce((sum, item) => sum + item.totalAmount, 0)

  return (
    <div className="min-h-screen bg-black flex">
      <ParticipantSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
                <p className="text-zinc-400">
                  Welcome back, <span className="text-[#e78a53]">{participant?.firstName || 'Participant'}</span>!
                </p>
              </div>
              <div className="flex items-center gap-2">
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg"><CalendarDays className="h-6 w-6 text-blue-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? '--' : eventBookings.length}</p>
                  <p className="text-zinc-400 text-sm">Events Joined</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg"><Briefcase className="h-6 w-6 text-purple-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? '--' : internshipApplications.length}</p>
                  <p className="text-zinc-400 text-sm">Applications</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg"><ShoppingBag className="h-6 w-6 text-green-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? '--' : foodOrders.length}</p>
                  <p className="text-zinc-400 text-sm">Food Orders</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-[#e78a53]/10 rounded-lg"><IndianRupee className="h-6 w-6 text-[#e78a53]" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? '--' : `₹${totalSpent}`}</p>
                  <p className="text-zinc-400 text-sm">Total Spent</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Internship Applications Section */}
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#e78a53]" />
                Active Internship Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="text-center py-8 text-zinc-500">Loading...</div>
              ) : internshipApplications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">You haven't applied to any internships yet.</p>
                  <Link href="/student/internships">
                    <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">Find Internships</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {internshipApplications.slice(0, 6).map((app) => (
                    <div key={app._id} className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                      <h4 className="text-white font-semibold text-sm mb-1">{app.internshipId.title}</h4>
                      <div className="text-zinc-400 text-xs space-y-1 mb-3">
                         <div className="flex items-center gap-1"><Building className="h-3 w-3"/> {app.internshipId.company}</div>
                         <div className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {app.internshipId.location}</div>
                      </div>
                      <Badge className={`text-xs ${
                        app.applicationStatus === 'selected' ? 'bg-green-500/10 text-green-400' :
                        app.applicationStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {app.applicationStatus.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Event Bookings */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-[#e78a53]" />
                  Recent Event Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventBookings.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">No bookings yet.</div>
                ) : (
                  <div className="space-y-4">
                    {eventBookings.map((booking) => (
                      <div key={booking._id} className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-white font-medium">{booking.eventTitle}</h4>
                           <Badge variant="outline" className={booking.paymentStatus === 'paid' ? 'text-green-400 border-green-500/30' : 'text-yellow-400'}>
                             {booking.paymentStatus}
                           </Badge>
                        </div>
                        <div className="text-zinc-400 text-xs space-y-1">
                           <div className="flex items-center gap-2"><Calendar className="h-3 w-3"/> {formatDate(booking.eventDate)}</div>
                           <div className="flex items-center gap-2"><MapPin className="h-3 w-3"/> {booking.eventVenue}</div>
                           <div className="flex justify-between mt-2 pt-2 border-t border-zinc-800">
                              <span className="text-[#e78a53] font-bold">₹{booking.totalAmount}</span>
                              <Link href={`/ticket?id=${booking._id}`} className="text-blue-400 hover:underline">View Ticket</Link>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Food Orders (Placeholder for layout balance) */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#e78a53]" />
                  Recent Food Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                 {foodOrders.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">No food orders yet.</div>
                 ) : (
                    <div className="space-y-4">
                       {foodOrders.map(order => (
                          <div key={order._id} className="p-4 bg-zinc-800/30 rounded-lg flex justify-between items-center">
                             <div>
                                <h4 className="text-white font-medium text-sm">{order.canteenName}</h4>
                                <p className="text-zinc-500 text-xs">{order.items.length} Items</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[#e78a53] font-bold text-sm">₹{order.totalAmount}</p>
                                <p className="text-xs text-zinc-500">{order.status}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}

function Ticket({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  )
}