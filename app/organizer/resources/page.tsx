"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrganizerSidebar } from "@/components/ui/organizer-sidebar" 
import {
  Monitor,
  Mic2,
  LayoutTemplate, // For Rooms/Halls
  Trophy, // For Sports
  Search,
  Filter,
  Clock,
  MapPin,
  Calendar,
  Users,
  Wifi,
  Wind, // For AC
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { UserMenu } from "@/components/user-menu"

// Updated Interface for Infrastructure
interface InfraResource {
  _id: string
  name: string
  description: string
  category: 'venue' | 'av_equipment' | 'it_lab' | 'sports'
  location: string
  status: 'available' | 'booked' | 'maintenance' | 'cleaning'
  capacity?: number
  features: string[] // e.g., ["Projector", "AC", "Sound System"]
  image?: string
  nextAvailable: string // Timestamp or string description
  managerContact?: string
  totalBookings: number
}

export default function OrganizerResourcesPage() {
  const [resources, setResources] = useState<InfraResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [stats, setStats] = useState({ 
    totalVenues: 0, 
    availableNow: 0, 
    maintenanceCount: 0 
  })

  useEffect(() => {
    fetchResources()
    
    // Polling for real-time availability (e.g., if someone books a room)
    const interval = setInterval(() => {
      fetchResources()
    }, 30000) 
    
    return () => clearInterval(interval)
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      // Changed API endpoint for organizer context
      const response = await fetch('/api/organizer/resources?limit=100')
      
      // MOCK DATA for demonstration if API fails (Remove this in production)
      if (!response.ok) {
        // Simulating data based on your requirements
        const mockData: InfraResource[] = [
            { _id: '1', name: 'Main Auditorium', description: 'Large hall for events & seminars', category: 'venue', location: 'Block A, Ground Floor', status: 'available', capacity: 500, features: ['Sound System', 'Projector', 'AC'], nextAvailable: 'Now', totalBookings: 120, image: '/auditorium.jpg' },
            { _id: '2', name: 'Computer Lab 3', description: 'High-performance PCs for coding', category: 'it_lab', location: 'Tech Block, 2nd Floor', status: 'booked', capacity: 60, features: ['50 PCs', 'High-speed Internet', 'Whiteboard'], nextAvailable: '2:00 PM Today', totalBookings: 45 },
            { _id: '3', name: 'Portable Projector Sony', description: 'HD Projector with HDMI', category: 'av_equipment', location: 'Media Store', status: 'available', features: ['HDMI', 'Wireless', 'Remote'], nextAvailable: 'Now', totalBookings: 80 },
            { _id: '4', name: 'Football Ground', description: 'Standard size turf ground', category: 'sports', location: 'Sports Complex', status: 'maintenance', features: ['Floodlights', 'Changing Room'], nextAvailable: 'Tomorrow', totalBookings: 200 },
            { _id: '5', name: 'JBL Sound System Set', description: '2 Speakers + 2 Mics', category: 'av_equipment', location: 'Media Store', status: 'available', features: ['Bluetooth', 'Mixer'], nextAvailable: 'Now', totalBookings: 50 },
        ]
        setResources(mockData)
        setStats({ totalVenues: 5, availableNow: 3, maintenanceCount: 1 })
        setLoading(false)
        return
      }

      const data = await response.json()
      setResources(data.resources || [])
      setStats(data.stats || { totalVenues: 0, availableNow: 0, maintenanceCount: 0 })
    } catch (error) {
      console.error('Error fetching resources:', error)
      setError('Failed to load infrastructure data.')
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const categoryMap: Record<string, string> = {
        'Venues': 'venue',
        'AV Tech': 'av_equipment',
        'IT Labs': 'it_lab',
        'Sports': 'sports'
    }

    const matchesCategory = selectedCategory === 'All' || resource.category === categoryMap[selectedCategory]
    return matchesSearch && matchesCategory
  })

  // Icons based on type
  const getCategoryIcon = (category: string) => {
    switch(category) {
        case 'venue': return <LayoutTemplate className="h-4 w-4" />
        case 'av_equipment': return <Mic2 className="h-4 w-4" />
        case 'it_lab': return <Monitor className="h-4 w-4" />
        case 'sports': return <Trophy className="h-4 w-4" />
        default: return <MapPin className="h-4 w-4" />
    }
  }

  // Status Colors
  const getStatusColor = (status: string) => {
    switch(status) {
        case 'available': return "bg-green-500/10 text-green-400 border-green-500/30"
        case 'booked': return "bg-red-500/10 text-red-400 border-red-500/30"
        case 'maintenance': return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
        default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'available': return <CheckCircle2 className="h-3 w-3 mr-1" />
          case 'booked': return <Clock className="h-3 w-3 mr-1" />
          case 'maintenance': return <AlertCircle className="h-3 w-3 mr-1" />
          default: return null
      }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <OrganizerSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Campus Infrastructure</h1>
                <p className="text-zinc-400">Manage bookings for halls, grounds, equipment, and labs</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search venue or equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <LayoutTemplate className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalVenues}</p>
                    <p className="text-zinc-400 text-sm">Total Facilities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.availableNow}</p>
                    <p className="text-zinc-400 text-sm">Available Now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.maintenanceCount}</p>
                    <p className="text-zinc-400 text-sm">Under Maintenance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Resource Type</h2>
            <div className="flex flex-wrap gap-3">
              {["All", "Venues", "AV Tech", "IT Labs", "Sports"].map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    category === selectedCategory
                      ? "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]"
                      : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                  }`}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Infrastructure Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e78a53] mx-auto"></div>
              <p className="text-zinc-400 mt-4">Checking availability...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <LayoutTemplate className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No infrastructure found</p>
              <p className="text-zinc-500 text-sm mt-2">Try adjusting filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource._id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-all flex flex-col">
                  {/* Image Placeholder - In real app, use next/image */}
                  <div className="h-40 bg-zinc-800 rounded-t-lg flex items-center justify-center text-zinc-600">
                    {resource.image ? (
                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center">Image of {resource.name}</div>
                    ) : (
                        <LayoutTemplate className="h-10 w-10" />
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                           {getCategoryIcon(resource.category)}
                           <span className="ml-1 capitalize text-xs">
                             {resource.category.replace('_', ' ')}
                           </span>
                        </Badge>
                      </div>
                      <Badge className={`text-xs flex items-center ${getStatusColor(resource.status)}`}>
                        {getStatusIcon(resource.status)}
                        <span className="capitalize">{resource.status}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{resource.name}</CardTitle>
                    <div className="flex items-center text-zinc-400 text-sm mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {resource.location}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 flex-1 flex flex-col">
                    <div className="space-y-3 mb-4 flex-1">
                      
                      {/* Capacity & Features Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                         {resource.capacity && (
                             <div className="bg-zinc-800/50 p-2 rounded flex items-center gap-2 text-zinc-300">
                                 <Users className="h-4 w-4 text-[#e78a53]" />
                                 {resource.capacity} Seats
                             </div>
                         )}
                         {resource.category === 'it_lab' && (
                             <div className="bg-zinc-800/50 p-2 rounded flex items-center gap-2 text-zinc-300">
                                 <Wifi className="h-4 w-4 text-blue-400" />
                                 High Speed
                             </div>
                         )}
                         {resource.category === 'venue' && (
                             <div className="bg-zinc-800/50 p-2 rounded flex items-center gap-2 text-zinc-300">
                                 <Wind className="h-4 w-4 text-cyan-400" />
                                 AC
                             </div>
                         )}
                      </div>

                      {/* Features Chips */}
                      <div className="flex flex-wrap gap-1 mt-2">
                          {resource.features.slice(0, 3).map((f, i) => (
                              <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full border border-zinc-700">
                                  {f}
                              </span>
                          ))}
                          {resource.features.length > 3 && (
                              <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-1 rounded-full border border-zinc-700">+{resource.features.length - 3}</span>
                          )}
                      </div>

                      {/* Next Availability Hint */}
                      <div className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-800 flex justify-between">
                          <span>Next Available:</span>
                          <span className="text-zinc-300 font-medium">{resource.nextAvailable}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button 
                        className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                        disabled={resource.status === 'maintenance' || resource.status === 'booked'}
                      >
                         Book Now
                      </Button>
                      <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                        <Calendar className="h-4 w-4" />
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