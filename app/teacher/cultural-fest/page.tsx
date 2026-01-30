"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserMenu } from "@/components/user-menu"
import { MapPin, Calendar, Clock, Loader2, ArrowRight, Bell } from "lucide-react"
import Link from "next/link"

export default function CulturalfestPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await fetch('/api/partcipant/events?type=cultural-fest') 
        const data = await res.json()
        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error("Failed to fetch cultural-fest")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkshops()
  }, [])

  return (
    <div className="min-h-screen bg-black flex">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Cultural Fest</h1>
            <p className="text-zinc-400 text-sm">Art, rhythm and identity in motion.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-zinc-400" /></Button>
            <UserMenu />
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-[#e78a53]" /></div>
          ) : events.length === 0 ? (
            <div className="text-zinc-500 text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800">
               No cultural-fest scheduled right now.
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

                    <Button className="w-full mt-2 bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
