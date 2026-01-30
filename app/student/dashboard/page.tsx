"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  Bell,
  ChevronRight,
  Clock,
  User,
  Trophy,
  Lightbulb,
  Music,
  Palette,
  Code,
  Heart,
  Star,
  Eye,
  CalendarDays,
  Building,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  IndianRupee,
  Receipt,
  ShoppingBag,
  CheckCircle,
  XCircle
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

export default function StudentDashboard() {
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([])
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([])
  const [internshipApplications, setInternshipApplications] = useState<InternshipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [persona, setPersona] = useState<"student" | "participant">("student")

  useEffect(() => {
    // Load current user and persona
    try {
      const user = localStorage.getItem('currentUser')
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
      }
      const storedPersona = localStorage.getItem('selectedPersona') as "student" | "participant" || "student"
      setPersona(storedPersona)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  const handlePersonaChange = (newPersona: "student" | "participant") => {
    setPersona(newPersona)
    localStorage.setItem('selectedPersona', newPersona)
    window.dispatchEvent(new Event('storage'))
  }

  useEffect(() => {
    if (currentUser) {
      fetchEventBookings()
      fetchFoodOrders()
      fetchInternshipApplications()
    }
  }, [currentUser])

  const fetchEventBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await fetch(`/api/event-bookings?studentId=${currentUser._id || currentUser.id}&limit=10`, { headers })
      if (response.ok) {
        const data = await response.json()
        setEventBookings(data.bookings || [])
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch event bookings:', response.status, errorData)
        setEventBookings([])
      }
    } catch (error) {
      console.error('Error fetching event bookings:', error)
      setEventBookings([])
    }
  }

  const fetchFoodOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await fetch(`/api/orders?customerId=${currentUser._id || currentUser.id}&limit=10`, { headers })
      if (response.ok) {
        const data = await response.json()
        // The API returns data field, not orders field
        setFoodOrders(data.data || [])
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch food orders:', response.status, errorData)
        setFoodOrders([])
      }
    } catch (error) {
      console.error('Error fetching food orders:', error)
      setFoodOrders([])
    }
  }
  
  const fetchInternshipApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await fetch(`/api/student/internships/apply?studentId=${currentUser._id || currentUser.id}`, { headers })
      if (response.ok) {
        const data = await response.json()
        setInternshipApplications(data.applications || [])
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch internship applications:', response.status, errorData)
        setInternshipApplications([])
      }
    } catch (error) {
      console.error('Error fetching internship applications:', error)
      setInternshipApplications([])
    } finally {
      setLoading(false)
    }
  }

  // Dummy events data for fallback
  const events = [
    {
      id: 1,
      title: "Tech Fest 2024",
      description: "Annual technology festival featuring coding competitions, workshops, and tech talks by industry experts.",
      date: "2024-03-15",
      time: "09:00 AM",
      location: "Main Auditorium",
      category: "Technology",
      organizer: "Computer Science Department",
      image: "/placeholder-tech.jpg",
      attendees: 250,
      maxAttendees: 300,
      status: "upcoming",
      tags: ["coding", "workshops", "tech-talks"],
      icon: <Code className="h-5 w-5" />
    },
    {
      id: 2,
      title: "Cultural Night",
      description: "Celebrate diversity with music, dance, and cultural performances from students across different backgrounds.",
      date: "2024-03-20",
      time: "06:00 PM",
      location: "Open Ground",
      category: "Cultural",
      organizer: "Cultural Committee",
      image: "/placeholder-cultural.jpg",
      attendees: 180,
      maxAttendees: 400,
      status: "upcoming",
      tags: ["music", "dance", "cultural"],
      icon: <Music className="h-5 w-5" />
    },
    {
      id: 3,
      title: "AI & Machine Learning Workshop",
      description: "Hands-on workshop on artificial intelligence and machine learning fundamentals with practical projects.",
      date: "2024-03-25",
      time: "10:00 AM",
      location: "Computer Lab 1",
      category: "Workshop",
      organizer: "AI Club",
      image: "/placeholder-ai.jpg",
      attendees: 45,
      maxAttendees: 50,
      status: "upcoming",
      tags: ["AI", "ML", "workshop"],
      icon: <Lightbulb className="h-5 w-5" />
    },
    {
      id: 4,
      title: "Inter-College Sports Meet",
      description: "Annual sports competition featuring various games including cricket, football, basketball, and athletics.",
      date: "2024-03-30",
      time: "08:00 AM",
      location: "Sports Complex",
      category: "Sports",
      organizer: "Sports Committee",
      image: "/placeholder-sports.jpg",
      attendees: 320,
      maxAttendees: 500,
      status: "upcoming",
      tags: ["sports", "competition", "athletics"],
      icon: <Trophy className="h-5 w-5" />
    },
    {
      id: 5,
      title: "Art Exhibition",
      description: "Showcase of creative artworks, paintings, sculptures, and digital art by talented students.",
      date: "2024-04-05",
      time: "11:00 AM",
      location: "Art Gallery",
      category: "Arts",
      organizer: "Fine Arts Department",
      image: "/placeholder-art.jpg",
      attendees: 85,
      maxAttendees: 150,
      status: "upcoming",
      tags: ["art", "exhibition", "creativity"],
      icon: <Palette className="h-5 w-5" />
    },
    {
      id: 6,
      title: "Career Fair 2024",
      description: "Meet with top companies and recruiters. Great opportunity for networking and job placements.",
      date: "2024-04-10",
      time: "09:00 AM",
      location: "Main Hall",
      category: "Career",
      organizer: "Placement Cell",
      image: "/placeholder-career.jpg",
      attendees: 200,
      maxAttendees: 350,
      status: "upcoming",
      tags: ["career", "jobs", "networking"],
      icon: <Briefcase className="h-5 w-5" />
    }
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Cultural: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Workshop: "bg-green-500/10 text-green-400 border-green-500/20",
      Sports: "bg-red-500/10 text-red-400 border-red-500/20",
      Arts: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      Career: "bg-orange-500/10 text-orange-400 border-orange-500/20"
    }
    return colors[category as keyof typeof colors] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
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
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {persona === "participant" ? "Participant Dashboard" : "Student Dashboard"}
                </h1>
                <p className="text-zinc-400">Your events, orders, and activity overview</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
            {/* Persona Toggle */}
            <div className="flex gap-2">
              <Button
                variant={persona === "student" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePersonaChange("student")}
                className={persona === "student" ? "bg-[#e78a53] hover:bg-[#e78a53]/90" : "border-zinc-700"}
              >
                Student
              </Button>
              <Button
                variant={persona === "participant" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePersonaChange("participant")}
                className={persona === "participant" ? "bg-[#e78a53] hover:bg-[#e78a53]/90" : "border-zinc-700"}
              >
                Participant
              </Button>
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
                    <p className="text-zinc-400 text-sm">Internship Applications</p>
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
                My Internship Applications
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
                  <p className="text-zinc-400">No internship applications yet</p>
                  <Link href="/student/internships">
                    <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-400 hover:text-white">
                      Browse Internships
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
                <Link href="/student/internships">
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
                    <Link href="/student/events">
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
                      <Link href="/student/events">
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
                    <Link href="/student/food">
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
                      <Link href="/student/food">
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
