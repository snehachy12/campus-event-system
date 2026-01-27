"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticipantSidebar } from "@/components/ui/participant-sidebar" // Updated import
import { UserMenu } from "@/components/user-menu"
import {
  Bell,
  CalendarDays,
  Building,
  Briefcase,
  MapPin,
  IndianRupee,
  Receipt,
  ShoppingBag,
  Clock,
  Calendar
} from "lucide-react"
import { useEffect, useState } from "react"

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
  razorpayPaymentId?: string
  createdAt: string
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
  reviewedAt?: string
}

export default function ParticipantDashboard() {
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([])
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
  const [internshipApplications, setInternshipApplications] = useState<InternshipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Load current user
    try {
      const user = localStorage.getItem('currentUser')
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchEventBookings()
      fetchFoodOrders()
      fetchInternshipApplications()
    }
  }, [currentUser])

  const fetchEventBookings = async () => {
    try {
      // Changed query param to participantId
      const response = await fetch(`/api/event-bookings?participantId=${currentUser._id || currentUser.id}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setEventBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching event bookings:', error)
    }
  }

  const fetchFoodOrders = async () => {
    try {
      // customerId remains valid for generic food orders
      const response = await fetch(`/api/orders?customerId=${currentUser._id || currentUser.id}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setFoodOrders(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching food orders:', error)
    }
  }
   
  const fetchInternshipApplications = async () => {
    try {
      // Updated endpoint to participant route
      const response = await fetch(`/api/participant/internships/apply?participantId=${currentUser._id || currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setInternshipApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching internship applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Updated Sidebar */}
      <ParticipantSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Participant Dashboard</h1>
                <p className="text-zinc-400">Your events, orders, and activity overview</p>
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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : eventBookings.length}</p>
                    <p className="text-zinc-400 text-sm">Event Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : foodOrders.length}</p>
                    <p className="text-zinc-400 text-sm">Food Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Briefcase className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : internshipApplications.length}</p>
                    <p className="text-zinc-400 text-sm">Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <IndianRupee className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {loading ? '--' : `₹${[...eventBookings, ...foodOrders].reduce((sum, item) => sum + item.totalAmount, 0)}`}
                    </p>
                    <p className="text-zinc-400 text-sm">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Receipt className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {loading ? '--' : [...eventBookings, ...foodOrders].filter(item => item.paymentStatus === 'paid').length}
                    </p>
                    <p className="text-zinc-400 text-sm">Paid Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Internship Applications */}
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#e78a53]" />
                My Opportunity Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                  <p className="text-zinc-400 mt-2">Loading...</p>
                </div>
              ) : internshipApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No applications yet</p>
                  {/* Updated Link */}
                  <Link href="/participant/internships">
                    <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-400 hover:text-white">
                      Browse Opportunities
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {internshipApplications.slice(0, 6).map((application) => (
                    <div key={application._id} className="p-4 bg-zinc-800/30 rounded-lg">
                      <div className="mb-2">
                        <h4 className="text-white font-semibold text-sm">{application.internshipId.title}</h4>
                        <p className="text-zinc-400 text-sm flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          {application.internshipId.company}
                        </p>
                      </div>
                      
                      <div className="space-y-1 text-xs text-zinc-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {application.internshipId.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {application.internshipId.duration}
                        </div>
                        {application.internshipId.stipend && (
                          <div className="flex items-center gap-1 text-[#e78a53]">
                            <IndianRupee className="h-3 w-3" />
                            {application.internshipId.stipend}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <Badge className={`text-xs ${
                          application.applicationStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                          application.applicationStatus === 'under_review' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          application.applicationStatus === 'shortlisted' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          application.applicationStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          application.applicationStatus === 'selected' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        }`}>
                          {application.applicationStatus === 'under_review' ? 'Under Review' : 
                           application.applicationStatus.charAt(0).toUpperCase() + application.applicationStatus.slice(1)}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {internshipApplications.length > 6 && (
                // Updated Link
                <Link href="/participant/internships">
                  <Button variant="outline" className="w-full mt-4 border-zinc-700 text-zinc-400 hover:text-white">
                    View All Applications
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Bookings */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#e78a53]" />
                  My Event Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                    <p className="text-zinc-400 mt-2">Loading...</p>
                  </div>
                ) : eventBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No event registrations yet</p>
                    {/* Updated Link */}
                    <Link href="/participant/events">
                      <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-400 hover:text-white">
                        Browse Events
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventBookings.slice(0, 5).map((booking) => (
                      <div key={booking._id} className="p-4 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">{booking.eventTitle}</h4>
                          <Badge className={`text-xs ${
                            booking.paymentStatus === 'paid' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : booking.paymentStatus === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus}
                          </Badge>
                        </div>
                        <div className="text-zinc-400 text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.eventVenue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(booking.eventDate)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[#e78a53] font-semibold">₹{booking.totalAmount}</span>
                            {booking.razorpayPaymentId && (
                              <span className="text-xs text-zinc-500">ID: {booking.bookingId}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {eventBookings.length > 5 && (
                      // Updated Link
                      <Link href="/participant/events">
                        <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                          View All Registrations
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Food Orders */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#e78a53]" />
                  Recent Food Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53] mx-auto"></div>
                    <p className="text-zinc-400 mt-2">Loading...</p>
                  </div>
                ) : foodOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No food orders yet</p>
                    {/* Updated Link */}
                    <Link href="/participant/food">
                      <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-400 hover:text-white">
                        Order Food
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {foodOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="p-4 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">{order.canteenName}</h4>
                          <Badge className={`text-xs ${
                            order.paymentStatus === 'paid' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : order.paymentStatus === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
                          </Badge>
                        </div>
                        <div className="text-zinc-400 text-sm space-y-1">
                          <p>{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[#e78a53] font-semibold">₹{order.totalAmount}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${
                                order.status === 'completed' ? 'border-green-500/30 text-green-400' :
                                order.status === 'preparing' ? 'border-yellow-500/30 text-yellow-400' :
                                order.status === 'cancelled' ? 'border-red-500/30 text-red-400' :
                                'border-zinc-500/30 text-zinc-400'
                              }`}>
                                {order.status}
                              </Badge>
                              <span className="text-xs text-zinc-500">{order.orderId}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {foodOrders.length > 5 && (
                      // Updated Link
                      <Link href="/participant/food">
                        <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                          View All Orders
                        </Button>
                      </Link>
                    )}
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