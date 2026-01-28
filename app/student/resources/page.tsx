"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Video,
  Code,
  Search,
  Filter,
  Clock,
  Star,
  Eye,
  Wrench,
  Building,
  User,
  MapPin,
  Calendar
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

interface Resource {
  _id: string
  name: string
  description: string
  category: 'book' | 'equipment' | 'facility'
  location: string
  isAvailable: boolean
  condition: 'excellent' | 'good' | 'fair' | 'damaged'
  status: 'active' | 'maintenance' | 'retired'
  tags: string[]
  image?: string
  
  // For Books
  isbn?: string
  author?: string
  publisher?: string
  edition?: string
  totalCopies?: number
  availableCopies?: number
  
  // For Equipment
  serialNumber?: string
  model?: string
  brand?: string
  specifications?: string
  
  // For Facilities
  capacity?: number
  amenities?: string[]
  operatingHours?: {
    start: string
    end: string
  }
  
  // Booking info
  maxBorrowDuration?: number
  requiresApproval: boolean
  currentBorrower?: string
  dueDate?: string
  totalBorrows: number
  createdAt: string
  updatedAt: string
}

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [stats, setStats] = useState({ totalActive: 0, totalAvailable: 0, totalBorrowed: 0 })

  useEffect(() => {
    fetchResources()
    
    // Set up real-time polling to fetch new data every 30 seconds
    const interval = setInterval(() => {
      fetchResources()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/resources?limit=100')
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }
      const data = await response.json()
      setResources(data.resources || [])
      setStats(data.stats || { totalActive: 0, totalAvailable: 0, totalBorrowed: 0 })
    } catch (error) {
      console.error('Error fetching resources:', error)
      setError('Failed to load resources. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.author && resource.author.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    const icons = {
      book: <BookOpen className="h-4 w-4" />,
      equipment: <Wrench className="h-4 w-4" />,
      facility: <Building className="h-4 w-4" />
    }
    return icons[category as keyof typeof icons] || <FileText className="h-4 w-4" />
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      book: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      equipment: "bg-green-500/10 border-green-500/30 text-green-400",
      facility: "bg-purple-500/10 border-purple-500/30 text-purple-400"
    }
    return colors[category as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: "text-green-400",
      good: "text-blue-400",
      fair: "text-yellow-400",
      damaged: "text-red-400"
    }
    return colors[condition as keyof typeof colors] || "text-zinc-400"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Learning Resources</h1>
                <p className="text-zinc-400">Access study materials, notes, and course content</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
                <Button onClick={fetchResources} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white" disabled={loading}>
                  <Clock className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalActive}</p>
                    <p className="text-zinc-400 text-sm">Total Resources</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <Download className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : resources.reduce((sum, r) => sum + r.totalBorrows, 0)}</p>
                    <p className="text-zinc-400 text-sm">Total Borrows</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <Eye className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalAvailable}</p>
                    <p className="text-zinc-400 text-sm">Available Now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                    <Clock className="h-6 w-6 text-[#e78a53]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{loading ? '--' : stats.totalBorrowed}</p>
                    <p className="text-zinc-400 text-sm">Currently Borrowed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {["All", "Book", "Equipment", "Facility"].map((category) => (
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

          {/* Resources Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e78a53] mx-auto"></div>
              <p className="text-zinc-400 mt-4">Loading resources...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchResources} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                Try Again
              </Button>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No resources found</p>
              <p className="text-zinc-500 text-sm mt-2">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource._id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-all">
                  {resource.image && (
                    <div className="h-48 bg-zinc-800 rounded-t-lg overflow-hidden">
                      <img 
                        src={resource.image} 
                        alt={resource.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge className={getCategoryColor(resource.category)}>
                        {getCategoryIcon(resource.category)}
                        <span className="ml-1 capitalize">{resource.category}</span>
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${resource.isAvailable ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                          {resource.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-white text-lg line-clamp-2">{resource.name}</CardTitle>
                    <p className="text-zinc-400 text-sm line-clamp-2">{resource.description}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Location</span>
                        <span className="text-zinc-300">{resource.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Condition</span>
                        <span className={`capitalize ${getConditionColor(resource.condition)}`}>
                          {resource.condition}
                        </span>
                      </div>
                      {resource.author && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Author</span>
                          <span className="text-zinc-300">{resource.author}</span>
                        </div>
                      )}
                      {resource.brand && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Brand</span>
                          <span className="text-zinc-300">{resource.brand}</span>
                        </div>
                      )}
                      {resource.capacity && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Capacity</span>
                          <span className="text-zinc-300">{resource.capacity} people</span>
                        </div>
                      )}
                      {resource.totalCopies && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Copies</span>
                          <span className="text-zinc-300">{resource.availableCopies}/{resource.totalCopies}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Total Borrows</span>
                        <div className="flex items-center gap-1 text-zinc-300">
                          <Download className="h-3 w-3" />
                          {resource.totalBorrows}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Added</span>
                        <span className="text-zinc-300">{formatDate(resource.createdAt)}</span>
                      </div>
                    </div>

                    {resource.tags && resource.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 3 && (
                            <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-400 text-xs">
                              +{resource.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90"
                        disabled={!resource.isAvailable || resource.status !== 'active'}
                      >
                        {resource.category === 'book' ? (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Borrow
                          </>
                        ) : resource.category === 'facility' ? (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Book
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Request
                          </>
                        )}
                      </Button>
                      <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recently Downloaded */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Recently Downloaded</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <FileText className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">Data Structures and Algorithms</h3>
                      <p className="text-zinc-400 text-sm">Downloaded yesterday</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-zinc-500 text-xs">15.2 MB</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs">4.8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Code className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">Python Programming Examples</h3>
                      <p className="text-zinc-400 text-sm">Downloaded 3 days ago</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-zinc-500 text-xs">3.4 MB</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs">4.7</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
