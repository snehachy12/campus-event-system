"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { MapPin, Loader2, Bell, Users, Phone, Mail, ArrowRight, CheckCircle2, IndianRupee } from "lucide-react"

interface Venue {
  _id: string
  name: string
  capacity: number
  location: string
  amenities?: string[]
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  pricePerHour?: number
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/venues', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        const data = await res.json()
        if (data.success) {
          setVenues(data.venues)
        }
      } catch (error) {
        console.error("Failed to fetch venues", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Browse Venues</h1>
            <p className="text-zinc-400 text-sm">Find the perfect venue for your events.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-zinc-400" /></Button>
            <UserMenu />
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center mt-20">
              <Loader2 className="animate-spin text-[#e78a53]" size={40} />
            </div>
          ) : venues.length === 0 ? (
            <div className="text-zinc-500 text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800">
              No venues available at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Card key={venue._id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-all flex flex-col overflow-hidden">
                  {/* Image Placeholder */}
                  <div className="h-40 bg-gradient-to-br from-[#e78a53]/20 to-zinc-800 rounded-t-lg flex items-center justify-center text-zinc-600">
                    <MapPin className="h-10 w-10" />
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        Venue
                      </Badge>
                      <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{venue.name}</CardTitle>
                    <div className="flex items-center text-zinc-400 text-sm mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {venue.location}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 flex-1 flex flex-col">
                    <div className="space-y-3 mb-4 flex-1">
                      {/* Capacity & Price Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-zinc-800/50 p-2 rounded flex items-center gap-2 text-zinc-300">
                          <Users className="h-4 w-4 text-[#e78a53]" />
                          {venue.capacity} Seats
                        </div>
                        {venue.pricePerHour && (
                          <div className="bg-zinc-800/50 p-2 rounded flex items-center gap-2 text-zinc-300">
                            <IndianRupee className="h-4 w-4 text-[#e78a53]" />
                            ₹{venue.pricePerHour}
                          </div>
                        )}
                      </div>

                      {/* Amenities Chips */}
                      {venue.amenities && venue.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {venue.amenities.slice(0, 3).map((amenity, i) => (
                            <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full border border-zinc-700">
                              {amenity}
                            </span>
                          ))}
                          {venue.amenities.length > 3 && (
                            <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-1 rounded-full border border-zinc-700">
                              +{venue.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contact Info */}
                      {venue.contactPhone && (
                        <div className="text-xs text-zinc-500 mt-3 pt-2 border-t border-zinc-800">
                          <p className="text-zinc-400 font-medium">{venue.contactPerson || 'Contact'}</p>
                          <p className="text-zinc-500">{venue.contactPhone}</p>
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Button className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                        Request Booking
                      </Button>
                    </div>
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
