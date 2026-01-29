'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit2, Trash2, Search, Loader2, AlertCircle, MapPin, Users, IndianRupee } from 'lucide-react';

interface Venue {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  address: string;
  rentPrice: number;
  amenities: string[];
  status: string;
  description?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
}

export default function VenueManagementPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    location: '',
    address: '',
    amenities: '',
    rentPrice: '',
    priceType: 'per_day',
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    rules: '',
    operatingHours: { start: '09:00', end: '18:00' },
  });

  // Fetch venues
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch('/api/admin/venues', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please log in again.');
          localStorage.removeItem('adminToken');
        } else {
          setError('Failed to fetch venues');
        }
        return;
      }

      const data = await response.json();
      setVenues(data.venues);
      setError(null);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError('Failed to fetch venues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
    setIsPageLoading(false);
  }, []);

  // Filter venues based on search and status
  useEffect(() => {
    let filtered = venues;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((venue) => venue.status === statusFilter);
    }

    setFilteredVenues(filtered);
  }, [venues, searchQuery, statusFilter]);

  // Handle form input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const amenitiesArray = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      const rulesArray = formData.rules
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r);

      const payload = {
        name: formData.name,
        description: formData.description,
        capacity: parseInt(formData.capacity),
        location: formData.location,
        address: formData.address,
        amenities: amenitiesArray,
        rentPrice: parseFloat(formData.rentPrice),
        priceType: formData.priceType,
        contactPersonName: formData.contactPersonName,
        contactPersonPhone: formData.contactPersonPhone,
        contactPersonEmail: formData.contactPersonEmail,
        rules: rulesArray,
        availability: {
          startDate: new Date().toISOString(),
          operatingHours: formData.operatingHours,
        },
      };

      const url = editingVenue ? `/api/admin/venues/${editingVenue._id}` : '/api/admin/venues';
      const method = editingVenue ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingVenue ? 'Venue updated successfully!' : 'Venue created successfully!');
        setFormData({
          name: '',
          description: '',
          capacity: '',
          location: '',
          address: '',
          amenities: '',
          rentPrice: '',
          priceType: 'per_day',
          contactPersonName: '',
          contactPersonPhone: '',
          contactPersonEmail: '',
          rules: '',
          operatingHours: { start: '09:00', end: '18:00' },
        });
        setEditingVenue(null);
        setIsCreateOpen(false);
        fetchVenues();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save venue');
    }
  };

  // Handle delete
  const handleDelete = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Venue deleted successfully!');
        fetchVenues();
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      alert('Failed to delete venue');
    }
  };

  // Handle edit
  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      description: '',
      capacity: venue.capacity.toString(),
      location: venue.location,
      address: '',
      amenities: venue.amenities.join(', '),
      rentPrice: venue.rentPrice.toString(),
      priceType: 'per_day',
      contactPersonName: venue.contactPersonName || '',
      contactPersonPhone: venue.contactPersonPhone || '',
      contactPersonEmail: venue.contactPersonEmail || '',
      rules: '',
      operatingHours: { start: '09:00', end: '18:00' },
    });
    setIsCreateOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 border-green-500/30 text-green-400',
      inactive: 'bg-red-500/20 border-red-500/30 text-red-400',
      maintenance: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  if (isPageLoading) {
    return (
      <div className="flex h-screen bg-black">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#e78a53]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            <div className="max-w-7xl">
              {error && (
                <Alert className="mb-6 bg-red-500/10 border-red-500/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white">Venue Management</h1>
                  <p className="text-zinc-400 mt-2">Manage campus venues and event halls</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingVenue(null);
                        setFormData({
                          name: '',
                          description: '',
                          capacity: '',
                          location: '',
                          address: '',
                          amenities: '',
                          rentPrice: '',
                          priceType: 'per_day',
                          contactPersonName: '',
                          contactPersonPhone: '',
                          contactPersonEmail: '',
                          rules: '',
                          operatingHours: { start: '09:00', end: '18:00' },
                        });
                      }}
                      className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Venue
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">{editingVenue ? 'Edit Venue' : 'Create New Venue'}</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        {editingVenue ? 'Update venue details' : 'Add a new venue to the system'}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-white">Venue Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Seminar Hall A"
                            className="bg-zinc-800 border-zinc-700 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="capacity" className="text-white">Capacity *</Label>
                          <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            placeholder="e.g., 100"
                            className="bg-zinc-800 border-zinc-700 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-white">Description *</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe the venue..."
                          className="bg-zinc-800 border-zinc-700 text-white"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location" className="text-white">Location *</Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g., Building A, Floor 2"
                            className="bg-zinc-800 border-zinc-700 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="address" className="text-white">Address *</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Full address"
                            className="bg-zinc-800 border-zinc-700 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rentPrice" className="text-white">Rent Price (₹) *</Label>
                          <Input
                            id="rentPrice"
                            name="rentPrice"
                            type="number"
                            value={formData.rentPrice}
                            onChange={handleInputChange}
                            placeholder="e.g., 5000"
                            className="bg-zinc-800 border-zinc-700 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="priceType" className="text-white">Price Type *</Label>
                          <select
                            id="priceType"
                            name="priceType"
                            value={formData.priceType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                          >
                            <option value="per_day">Per Day</option>
                            <option value="per_event">Per Event</option>
                            <option value="hourly">Hourly</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="amenities" className="text-white">Amenities (comma-separated)</Label>
                        <Input
                          id="amenities"
                          name="amenities"
                          value={formData.amenities}
                          onChange={handleInputChange}
                          placeholder="e.g., Projector, WiFi, AC, Parking"
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="contactPersonName" className="text-white">Contact Person Name</Label>
                          <Input
                            id="contactPersonName"
                            name="contactPersonName"
                            value={formData.contactPersonName}
                            onChange={handleInputChange}
                            placeholder="Contact name"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPersonPhone" className="text-white">Phone</Label>
                          <Input
                            id="contactPersonPhone"
                            name="contactPersonPhone"
                            value={formData.contactPersonPhone}
                            onChange={handleInputChange}
                            placeholder="Contact phone"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPersonEmail" className="text-white">Email</Label>
                          <Input
                            id="contactPersonEmail"
                            name="contactPersonEmail"
                            type="email"
                            value={formData.contactPersonEmail}
                            onChange={handleInputChange}
                            placeholder="Contact email"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="rules" className="text-white">Rules (comma-separated)</Label>
                        <Textarea
                          id="rules"
                          name="rules"
                          value={formData.rules}
                          onChange={handleInputChange}
                          placeholder="e.g., No smoking, No loud music after 10 PM"
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
                        {editingVenue ? 'Update Venue' : 'Create Venue'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search and Filter */}
              <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-[250px] relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        placeholder="Search venues by name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-zinc-800/50 border-zinc-700 text-white"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="border-zinc-700 text-zinc-400"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Venues List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#e78a53]" />
                  </div>
                ) : filteredVenues.length === 0 ? (
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-8 text-center">
                      <p className="text-zinc-400">No venues found</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredVenues.map((venue) => (
                    <Card key={venue._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white">{venue.name}</h3>
                              <Badge className={getStatusBadge(venue.status)}>
                                {venue.status}
                              </Badge>
                            </div>

                            <p className="text-zinc-400 mb-4">{venue.location}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div className="flex items-center gap-2 text-zinc-300">
                                <Users className="h-4 w-4" />
                                {venue.capacity} Capacity
                              </div>
                              <div className="flex items-center gap-2 text-zinc-300">
                                <IndianRupee className="h-4 w-4" />
                                ₹{venue.rentPrice}
                              </div>
                              <div className="flex items-center gap-2 text-zinc-300">
                                <MapPin className="h-4 w-4" />
                                {venue.address}
                              </div>
                              {venue.amenities.length > 0 && (
                                <div className="text-zinc-300">
                                  {venue.amenities.length} Amenities
                                </div>
                              )}
                            </div>

                            {venue.contactPersonName && (
                              <div className="text-sm text-zinc-400 mb-4">
                                <p><strong>Contact:</strong> {venue.contactPersonName}</p>
                                {venue.contactPersonPhone && <p>{venue.contactPersonPhone}</p>}
                                {venue.contactPersonEmail && <p>{venue.contactPersonEmail}</p>}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(venue)}
                              className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(venue._id)}
                              className="border-zinc-700 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
