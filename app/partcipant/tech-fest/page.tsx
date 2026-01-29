"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticipantSidebar } from "@/components/ui/partcipant-sidebar"
import { MapPin, Calendar, Clock, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function TechfestPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTechfest = async () => {
      try {
    
        const res = await fetch('/api/partcipant/events?type=tech-fest') 
        const data = await res.json()
        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error("Failed to fetch tech-fest")
      } finally {
        setLoading(false)
      }
    }

    fetchTechfest()
  }, [])

  return (
    <div className="min-h-screen bg-black flex">
      <ParticipantSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Tech-fest</h1>
        <p className="text-zinc-400 mb-8">Coding Skills.</p>

        {loading ? (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-[#e78a53]" /></div>
        ) : events.length === 0 ? (
          <div className="text-zinc-500 text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800">
             No technical events scheduled right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event._id} className="bg-zinc-900/50 border-zinc-800 hover:border-[#e78a53]/50 transition-colors flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Workshop</Badge>
                    <span className="text-xs text-zinc-500 font-mono">
                       {event.price > 0 ? `₹${event.price}` : 'Free'}
                    </span>
                  </div>
                  <CardTitle className="text-white text-lg line-clamp-1">{event.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  {/* Dynamic Field: Prerequisites (Only shows if Organizer added it) */}
                  {event.prerequisites && (
                    <div className="text-xs bg-zinc-950 p-2 rounded border border-zinc-800 text-zinc-400">
                      <span className="font-semibold text-zinc-300">Prereq:</span> {event.prerequisites}
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-zinc-400 flex-1">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#e78a53]" /> 
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#e78a53]" /> 
                      {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#e78a53]" /> 
                      {event.venue}
                    </div>
                  </div>

                  <Link href={`/ticket/${event._id}`} className="w-full">
                    <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white mt-auto">
                      View Details <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}