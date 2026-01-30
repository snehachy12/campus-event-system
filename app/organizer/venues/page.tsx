'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, IndianRupee, Wifi, MoreHorizontal, CheckCircle2 } from 'lucide-react';

interface Venue {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  address: string;
  rentPrice: number;
  priceType: string;
  amenities: string[];
  status: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}


export default function VenuesBrowsingPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [bookingForm, setBookingForm] = useState({
    eventName: '',
    eventDescription: '',
    eventDate: '',
    eventStartTime: '09:00',
    eventEndTime: '18:00',
    expectedAttendees: '',
    purpose: '',
    specialRequirements: '',
  });
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const persona = localStorage.getItem("selectedPersona");
    const userStr = localStorage.getItem("currentUser");
    let isApproved = false;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        isApproved = user.role === "organizer" && (user.roleRequestStatus === "approved" || user.isApproved);
      } catch {}
    }
    setAllowed(persona === "organizer" && isApproved);
    setChecked(true);
  }, []);

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Checking permissions...</div>;
  }
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>You must be an approved organizer and have selected the Organizer persona to view this page.</p>
        </div>
      </div>
    );
  }

  // Fetch user data from localStorage/session
  useEffect(() => {
    const userData = localStorage.getItem('userEmail'); // Adjust based on your auth system
    const token = localStorage.getItem('token');

    if (!token || !userData) {
      alert('Please login first');
      return;
    }

    // Parse user data - adjust based on your actual user data structure
    const userEmail = userData;
    setUser({
      id: localStorage.getItem('userId') || '',
      name: localStorage.getItem('userName') || '',
      email: userEmail,
      phone: localStorage.getItem('userPhone') ?? undefined,
      role: localStorage.getItem('userRole') || 'student',
    });

    fetchVenues();
  }, []);

  // Fetch venues
  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        const errorMsg = 'No authentication token found. Please log in again.';
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      console.log('Fetching venues with token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/venues', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg = 'Unauthorized - Please log in again.';
          console.error(errorMsg);
          setError(errorMsg);
          localStorage.removeItem('token');
        } else {
          const errorData = await response.json();
          const errorMsg = errorData.error || `Failed to fetch venues (${response.status})`;
          console.error('Error fetching venues:', errorMsg);
          setError(errorMsg);
        }
        return;
      }

      const data = await response.json();
      console.log('Fetched venues:', data);
      setVenues(data.venues || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch venues';
      console.error('Error fetching venues:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit booking request
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVenue || !user) return;

    try {
      const token = localStorage.getItem('token');
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
        organizerName: user.name,
        organizerEmail: user.email,
        organizerPhone: user.phone || 'N/A',
      };

      console.log('Sending booking payload:', payload);

      const response = await fetch(`/api/venues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-persona': 'organizer',
        },
        body: JSON.stringify(payload),
      });

      console.log('Booking response status:', response.status);
      const responseData = await response.json();
      console.log('Booking response data:', responseData);

      if (response.ok) {
        alert('Booking request submitted! Admin will review and approve/reject your request.');
        setBookingForm({
          eventName: '',
          eventDescription: '',
          eventDate: '',
          eventStartTime: '09:00',
          eventEndTime: '18:00',
          expectedAttendees: '',
          purpose: '',
          specialRequirements: '',
        });
        setIsBookingOpen(false);
        setSelectedVenue(null);
      } else {
        const errorMsg = responseData.error || 'Failed to submit booking request';
        console.error('Booking error:', errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Browse Venues</h1>
          <p className="text-gray-600 mt-2">Find and book campus venues for your events</p>
          {/* Debug info */}
          <p className="text-sm text-gray-500 mt-4">Venues loaded: {venues.length} | Loading: {loading ? 'Yes' : 'No'} | User: {user?.email || 'Not logged in'}</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700 font-semibold">Error: {error}</p>
              <p className="text-sm text-red-600 mt-2">Please check your connection or try logging in again.</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading venues...</p>
          </div>
        ) : venues.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">No venues available at this time</p>
              <p className="text-sm text-gray-500">Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
              <p className="text-sm text-gray-500">Role: {user?.role || 'Unknown'}</p>
            </CardContent>
          </Card>
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
                    <p className="text-zinc-300 text-sm line-clamp-2">{venue.description}</p>
                    
                    {/* Capacity & Price Grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-zinc-800/50 p-2 rounded flex items-center gap-2 text-zinc-300">
                        <Users className="h-4 w-4 text-[#e78a53]" />
                        {venue.capacity} Seats
                      </div>
                      <div className="bg-zinc-800/50 p-2 rounded flex items-center gap-2 text-zinc-300">
                        <IndianRupee className="h-4 w-4 text-[#e78a53]" />
                        ₹{venue.rentPrice}
                      </div>
                    </div>

                    {/* Amenities Chips */}
                    {venue.amenities.length > 0 && (
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
                    {venue.contactPersonName && (
                      <div className="text-xs text-zinc-500 mt-3 pt-2 border-t border-zinc-800">
                        <p className="text-zinc-400 font-medium">{venue.contactPersonName}</p>
                        {venue.contactPersonPhone && <p className="text-zinc-500">{venue.contactPersonPhone}</p>}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <Dialog open={isBookingOpen && selectedVenue?._id === venue._id} onOpenChange={setIsBookingOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedVenue(venue)}
                          className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                        >
                          Book Now
                        </Button>
                      </DialogTrigger>

                      {selectedVenue?._id === venue._id && (
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Book {venue.name}</DialogTitle>
                            <DialogDescription>
                              Fill in your event details to request a booking
                            </DialogDescription>
                          </DialogHeader>

                          <form onSubmit={handleSubmitBooking} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="eventName">Event Name *</Label>
                                <Input
                                  id="eventName"
                                  name="eventName"
                                  value={bookingForm.eventName}
                                  onChange={handleInputChange}
                                  placeholder="e.g., Annual Gala"
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="eventDate">Event Date *</Label>
                                <Input
                                  id="eventDate"
                                  name="eventDate"
                                type="date"
                                value={bookingForm.eventDate}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="eventDescription">Event Description *</Label>
                            <Textarea
                              id="eventDescription"
                              name="eventDescription"
                              value={bookingForm.eventDescription}
                              onChange={handleInputChange}
                              placeholder="Describe your event..."
                              required
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="eventStartTime">Start Time *</Label>
                              <Input
                                id="eventStartTime"
                                name="eventStartTime"
                                type="time"
                                value={bookingForm.eventStartTime}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="eventEndTime">End Time *</Label>
                              <Input
                                id="eventEndTime"
                                name="eventEndTime"
                                type="time"
                                value={bookingForm.eventEndTime}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="expectedAttendees">Expected Attendees *</Label>
                              <Input
                                id="expectedAttendees"
                                name="expectedAttendees"
                                type="number"
                                value={bookingForm.expectedAttendees}
                                onChange={handleInputChange}
                                placeholder="e.g., 50"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="purpose">Purpose of Event *</Label>
                            <select
                              id="purpose"
                              name="purpose"
                              value={bookingForm.purpose}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              required
                            >
                              <option value="">Select purpose</option>
                              <option value="academic">Academic</option>
                              <option value="cultural">Cultural</option>
                              <option value="sports">Sports</option>
                              <option value="workshop">Workshop</option>
                              <option value="seminar">Seminar</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="specialRequirements">Special Requirements</Label>
                            <Textarea
                              id="specialRequirements"
                              name="specialRequirements"
                              value={bookingForm.specialRequirements}
                              onChange={handleInputChange}
                              placeholder="Any special requirements? (optional)"
                            />
                          </div>

                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Submit Booking Request
                          </Button>
                        </form>
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
  );
}
