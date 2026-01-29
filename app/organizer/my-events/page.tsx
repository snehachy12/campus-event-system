"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrganizerSidebar } from "@/components/organizer-sidebar"
import { 
  Calendar, MapPin, Clock, Edit, Trash2, 
  MoreVertical, Plus, Users, Ticket, Loader2, Eye 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Event {
  _id: string
  title: string
  eventType: string
  startDate: string
  endDate: string
  startTime: string
  venue: string
  status: 'published' | 'draft' | 'cancelled' | 'completed'
  capacity: number
  soldCount?: number // Optional if you haven't implemented sales tracking yet
  price: number
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (!userStr) return
        const user = JSON.parse(userStr)

        const res = await fetch(`/api/organizer/events/my-events?userId=${user._id || user.id}`)
        const data = await res.json()
        
        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error("Failed to fetch events", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyEvents()
  }, [])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <OrganizerSidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
            <p className="text-zinc-400">Manage your workshops, fests, and seminars.</p>
          </div>
          <Link href="/organizer/create-event">
            <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create New Event
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-[#e78a53]" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800">
             <Calendar className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white">No Events Yet</h3>
             <p className="text-zinc-500 mt-2 mb-6">You haven't hosted any events yet.</p>
             <Link href="/organizer/create-event">
                <Button variant="outline" className="border-zinc-700 text-zinc-300">Create your first event</Button>
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((event) => (
              <Card key={event._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all group">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                  
                  {/* Date Box */}
                  <div className="flex-shrink-0 w-16 h-16 bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-500 font-bold uppercase">
                      {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white truncate">{event.title}</h3>
                      <Badge className={`capitalize ${getStatusColor(event.status)}`}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mt-2">
                       <span className="flex items-center gap-1">
                         <MapPin className="h-4 w-4 text-[#e78a53]" /> {event.venue}
                       </span>
                       <span className="flex items-center gap-1">
                         <Clock className="h-4 w-4 text-[#e78a53]" /> {event.startTime}
                       </span>
                       <span className="flex items-center gap-1">
                         <Ticket className="h-4 w-4 text-[#e78a53]" /> 
                         {event.price > 0 ? `₹${event.price}` : 'Free'}
                       </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 px-4 border-l border-zinc-800 hidden md:flex">
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Sold</p>
                      <p className="text-lg font-bold text-white">{event.soldCount || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Capacity</p>
                      <p className="text-lg font-bold text-white">{event.capacity}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Users className="h-4 w-4 mr-2" /> View Attendees
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 cursor-pointer focus:text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" /> Cancel Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}