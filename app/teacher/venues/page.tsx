"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  Filter, 
  Bell,
  Users,
  MapPin,
  IndianRupee,
  Building,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

interface Venue {
  _id: string
  name: string
  description: string
  capacity: number
  location: string
  address: string
  rentPrice: number
  priceType: string
  amenities: string[]
  status: string
  contactPersonName?: string
  contactPersonPhone?: string
  contactPersonEmail?: string
}

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

interface BookingForm {
  eventName: string
  eventDescription: string
  eventDate: string
  eventStartTime: string
  eventEndTime: string
  expectedAttendees: string
  purpose: string
  specialRequirements: string
}

export default function TeacherVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    eventStartTime: "09:00",
    eventEndTime: "18:00",
    expectedAttendees: "",
    purpose: "",
    specialRequirements: ""
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Load user data
  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Please log in first')
        return
      }

      // Get full user data from localStorage
      const userDataStr = localStorage.getItem('currentUser')
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        setCurrentUser({
          id: userData.id || '',
          name: userData.name || '',
          email: userData.email || '',
          phone: localStorage.getItem('userPhone') ?? undefined,
          role: userData.role || 'teacher'
        })
      }

      fetchVenues()
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load user data')
    }
  }, [])

  // Fetch venues
  const fetchVenues = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')

      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/venues', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized - Please log in again')
          localStorage.removeItem('token')
        } else {
          setError('Failed to fetch venues')
        }
        return
      }

      const data = await response.json()
      setVenues(data.venues || [])
    } catch (err) {
      console.error('Error fetching venues:', err)
      setError('Failed to fetch venues')
    } finally {
      setLoading(false)
    }
  }

  // Filter venues based on search
  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const stats = {
    totalVenues: venues.length,
    avgCapacity: venues.length > 0 ? Math.round(venues.reduce((sum, v) => sum + v.capacity, 0) / venues.length) : 0,
    avgPrice: venues.length > 0 ? Math.round(venues.reduce((sum, v) => sum + v.rentPrice, 0) / venues.length) : 0,
    amenitiesCount: new Set(venues.flatMap(v => v.amenities)).size
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBookingForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVenue || !currentUser) {
      setBookingError('Missing venue or user information')
      return
    }

    try {
      setBookingLoading(true)
      setBookingError(null)
      const token = localStorage.getItem('token')

      if (!token) {
        setBookingError('Authentication token not found')
        setBookingLoading(false)
        return
      }

      const payload = {
        venueId: selectedVenue._id,
        eventName: bookingForm.eventName,
        eventDescription: bookingForm.eventDescription,
        eventDate: bookingForm.eventDate,
        eventStartTime: bookingForm.eventStartTime,
        eventEndTime: bookingForm.eventEndTime,
        expectedAttendees: parseInt(bookingForm.expectedAttendees),
        purpose: bookingForm.purpose,
        specialRequirements: bookingForm.specialRequirements,
        organizerName: currentUser.name,
        organizerEmail: currentUser.email,
        organizerPhone: currentUser.phone || 'N/A'
      }

      console.log('Sending booking payload:', payload)
      console.log('Current user:', currentUser)

      const response = await fetch(`/api/venues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || 'Failed to submit booking request'
        console.error('Booking error:', errorMsg)
        setBookingError(errorMsg)
        return
      }

      setBookingSuccess(true)
      setTimeout(() => {
        setIsBookingOpen(false)
        setBookingSuccess(false)
        setBookingForm({
          eventName: '',
          eventDescription: '',
          eventDate: '',
          eventStartTime: '09:00',
          eventEndTime: '18:00',
          expectedAttendees: '',
          purpose: '',
          specialRequirements: ''
        })
      }, 2000)
    } catch (err) {
      console.error('Error submitting booking:', err)
      setBookingError('Failed to submit booking request')
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-black">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Venues</h1>
              <div className="flex items-center gap-4">
                <div className="relative hidden md:flex">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-400 hover:text-white"
                  onClick={fetchVenues}
                  disabled={loading}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {loading ? "Loading..." : "Refresh"}
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <Building className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalVenues}</p>
                      <p className="text-zinc-400 text-sm">Total Venues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <Users className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.avgCapacity}</p>
                      <p className="text-zinc-400 text-sm">Avg Capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <IndianRupee className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">₹{stats.avgPrice}</p>
                      <p className="text-zinc-400 text-sm">Avg Rent Price</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.amenitiesCount}</p>
                      <p className="text-zinc-400 text-sm">Amenities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Alert */}
            {error && (
              <Card className="bg-red-500/10 border-red-500/30 mb-8">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Venues Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#e78a53]" />
              </div>
            ) : filteredVenues.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Building className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No venues available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map(venue => (
                  <Card key={venue._id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors flex flex-col">
                    {/* Venue Header */}
                    <div className="bg-gradient-to-r from-[#e78a53]/20 to-[#e78a53]/10 p-6 border-b border-zinc-800">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">{venue.name}</h3>
                        <Badge className="bg-green-500/20 border-green-500/30 text-green-400">Active</Badge>
                      </div>
                      <p className="text-zinc-400 text-sm">{venue.location}</p>
                    </div>

                    {/* Venue Content */}
                    <CardContent className="flex-grow p-6 space-y-4">
                      <p className="text-zinc-300 text-sm line-clamp-2">{venue.description}</p>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                          <Users className="h-4 w-4 text-[#e78a53]" />
                          <span>Capacity: <strong>{venue.capacity}</strong> people</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                          <IndianRupee className="h-4 w-4 text-[#e78a53]" />
                          <span>Rent: <strong>₹{venue.rentPrice}</strong> {venue.priceType.replace('_', ' ')}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                          <MapPin className="h-4 w-4 text-[#e78a53]" />
                          <span>{venue.address}</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      {venue.amenities.length > 0 && (
                        <div>
                          <p className="text-zinc-400 text-sm font-semibold mb-2">Amenities:</p>
                          <div className="flex flex-wrap gap-2">
                            {venue.amenities.slice(0, 3).map((amenity, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">
                                {amenity}
                              </Badge>
                            ))}
                            {venue.amenities.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">
                                +{venue.amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      {venue.contactPersonName && (
                        <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700">
                          <p className="text-zinc-400 text-xs mb-1">Contact Person</p>
                          <p className="text-white text-sm font-semibold">{venue.contactPersonName}</p>
                          <p className="text-zinc-400 text-xs">{venue.contactPersonPhone}</p>
                        </div>
                      )}
                    </CardContent>

                    {/* Action Button */}
                    <div className="border-t border-zinc-800 p-4">
                      <Dialog open={isBookingOpen && selectedVenue?._id === venue._id} onOpenChange={setIsBookingOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedVenue(venue)}
                            className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                          >
                            Request Booking
                          </Button>
                        </DialogTrigger>

                        {selectedVenue?._id === venue._id && (
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                            <DialogHeader>
                              <DialogTitle className="text-white">Book {venue.name}</DialogTitle>
                              <DialogDescription className="text-zinc-400">
                                Fill in your event details to request a booking
                              </DialogDescription>
                            </DialogHeader>

                            {bookingSuccess ? (
                              <div className="flex flex-col items-center justify-center py-12">
                                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                                <p className="text-white text-lg font-semibold">Booking request submitted!</p>
                                <p className="text-zinc-400 text-sm">We'll notify you soon</p>
                              </div>
                            ) : (
                              <form onSubmit={handleSubmitBooking} className="space-y-4">
                                {bookingError && (
                                  <div className="bg-red-500/10 border border-red-500/30 rounded p-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <p className="text-red-400 text-sm">{bookingError}</p>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-zinc-300">Event Name *</Label>
                                    <Input
                                      name="eventName"
                                      value={bookingForm.eventName}
                                      onChange={handleInputChange}
                                      required
                                      className="bg-zinc-800 border-zinc-700 text-white"
                                      placeholder="e.g., Annual Conference"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-zinc-300">Event Date *</Label>
                                    <Input
                                      name="eventDate"
                                      type="date"
                                      value={bookingForm.eventDate}
                                      onChange={handleInputChange}
                                      required
                                      className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-zinc-300">Start Time *</Label>
                                    <Input
                                      name="eventStartTime"
                                      type="time"
                                      value={bookingForm.eventStartTime}
                                      onChange={handleInputChange}
                                      required
                                      className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-zinc-300">End Time *</Label>
                                    <Input
                                      name="eventEndTime"
                                      type="time"
                                      value={bookingForm.eventEndTime}
                                      onChange={handleInputChange}
                                      required
                                      className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-zinc-300">Expected Attendees *</Label>
                                    <Input
                                      name="expectedAttendees"
                                      type="number"
                                      value={bookingForm.expectedAttendees}
                                      onChange={handleInputChange}
                                      required
                                      className="bg-zinc-800 border-zinc-700 text-white"
                                      placeholder="0"
                                      max={venue.capacity}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-zinc-300">Purpose *</Label>
                                    <Input
                                      name="purpose"
                                      value={bookingForm.purpose}
                                      onChange={handleInputChange}
                                      required
                                      className="bg-zinc-800 border-zinc-700 text-white"
                                      placeholder="e.g., Meeting"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-zinc-300">Event Description *</Label>
                                  <Textarea
                                    name="eventDescription"
                                    value={bookingForm.eventDescription}
                                    onChange={handleInputChange}
                                    required
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    placeholder="Describe your event..."
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <Label className="text-zinc-300">Special Requirements</Label>
                                  <Textarea
                                    name="specialRequirements"
                                    value={bookingForm.specialRequirements}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    placeholder="Any special requirements..."
                                    rows={2}
                                  />
                                </div>

                                <div className="flex gap-4 pt-4">
                                  <Button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                                  >
                                    {bookingLoading ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                      </>
                                    ) : (
                                      'Submit Request'
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsBookingOpen(false)}
                                    className="flex-1 border-zinc-700 text-zinc-400"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            )}
                          </DialogContent>
                        )}
                      </Dialog>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
