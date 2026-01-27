"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticipantSidebar } from "@/components/ui/participant-sidebar"
import {
  Bell,
  ChevronRight,
  Clock,
  User,
  Trophy,
  Lightbulb,
  Music,
  CalendarDays,
  Building,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Megaphone,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import { EventBookingDialog } from "@/components/ui/event-booking-dialog"

// --- Interfaces ---

interface Event {
  _id: string
  title: string
  description: string
  eventType: 'academic' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'other'
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  venue: string
  organizer: string
  fee: number
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  tags: string[]
  maxParticipants?: number
}

// Matches your ParticipantSchema
interface Participant {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  studentId: string
  course: string
  branch: string
}

export default function ParticipantEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Dialog State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchEvents(), fetchParticipantProfile()])
      setLoading(false)
    }
    
    init()
    
    // Real-time polling
    const interval = setInterval(fetchEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  // 1. Fetch Events
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=50') // Assumes a general events endpoint
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data.events || data || []) // Handle potential array or object response
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events.')
    }
  }

  // 2. Fetch Current Participant (The "Me" endpoint)
  const fetchParticipantProfile = async () => {
    try {
      // Replace this with your actual profile endpoint
      // e.g., /api/participant/me or /api/auth/session
      const response = await fetch('/api/participant/profile') 
      
      if (response.ok) {
        const data = await response.json()
        setParticipant(data)
      } else {
        console.error("Failed to fetch participant profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  // --- Helpers ---

  const getCategoryColor = (eventType: string) => {
    const colors: Record<string, string> = {
      academic: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      cultural: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      workshop: "bg-green-500/10 text-green-400 border-green-500/20",
      sports: "bg-red-500/10 text-red-400 border-red-500/20",
      seminar: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      other: "bg-pink-500/10 text-pink-400 border-pink-500/20"
    }
    return colors[eventType] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  }

  const getCategoryIcon = (eventType: string) => {
    const icons: Record<string, JSX.Element> = {
      academic: <GraduationCap className="h-5 w-5" />,
      cultural: <Music className="h-5 w-5" />,
      workshop: <Lightbulb className="h-5 w-5" />,
      sports: <Trophy className="h-5 w-5" />,
      seminar: <Megaphone className="h-5 w-5" />,
      other: <BookOpen className="h-5 w-5" />
    }
    return icons[eventType] || <BookOpen className="h-5 w-5" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // --- Handlers ---

  const handleEventRegistration = (event: Event) => {
    if (!participant) {
      alert("Please log in to register for events.")
      return
    }
    setSelectedEvent(event)
    setShowBookingDialog(true)
  }

  const handleBookingSuccess = () => {
    setShowBookingDialog(false)
    fetchEvents() // Refresh to update participant counts
    // Optional: Show toast notification here
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar matches Participant context */}
      <ParticipantSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Campus Events</h1>
                <p className="text-zinc-400">
                  Welcome back, <span className="text-[#e78a53]">{participant?.firstName || 'Student'}</span>! 
                  Discover what's happening.
                </p>
                {lastUpdated && (
                  <p className="text-zinc-500 text-xs mt-1">Updated: {lastUpdated.toLocaleTimeString()}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => fetchEvents()} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                  <Clock className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg"><CalendarDays className="h-6 w-6 text-blue-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white">{events.length}</p>
                  <p className="text-zinc-400 text-sm">Active Events</p>
                </div>
              </CardContent>
            </Card>
            {/* Add more stats cards as needed */}
          </div>

          {/* Loading State */}
          {loading && events.length === 0 ? (
            <div className="text-center py-20">
              <Loader2 className="h-10 w-10 text-[#e78a53] animate-spin mx-auto mb-4" />
              <p className="text-zinc-500">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
              <Button onClick={() => fetchEvents()} variant="link" className="text-[#e78a53]">Try Again</Button>
            </div>
          ) : (
            /* Events Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event._id} className="bg-zinc-900/50 border-zinc-800 hover:border-[#e78a53]/50 transition-all group flex flex-col h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-[#e78a53]/10 rounded-lg text-[#e78a53]">
                        {getCategoryIcon(event.eventType)}
                      </div>
                      <Badge className={`${getCategoryColor(event.eventType)} border`}>
                        {event.eventType}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-xl line-clamp-1">{event.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <p className="text-zinc-400 text-sm line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 mt-auto pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Calendar className="h-4 w-4 text-[#e78a53]" />
                        <span>{formatDate(event.startDate)} • {event.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <MapPin className="h-4 w-4 text-[#e78a53]" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                         <span className={`font-bold ${event.fee > 0 ? 'text-[#e78a53]' : 'text-green-400'}`}>
                           {event.fee > 0 ? `₹${event.fee}` : 'Free'}
                         </span>
                         {event.maxParticipants && (
                           <span className="text-xs text-zinc-500 flex items-center gap-1">
                             <Users className="h-3 w-3" /> {event.maxParticipants} Seats
                           </span>
                         )}
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white mt-4"
                      onClick={() => handleEventRegistration(event)}
                      disabled={!participant}
                    >
                      {participant ? 'Register Now' : 'Login to Register'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Booking Dialog */}
      {/* Ensure EventBookingDialog accepts 'student' prop */}
      {showBookingDialog && participant && selectedEvent && (
        <EventBookingDialog
          isOpen={showBookingDialog}
          onClose={() => setShowBookingDialog(false)}
          event={selectedEvent}
          student={participant} // <--- Passing the participant data here
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}