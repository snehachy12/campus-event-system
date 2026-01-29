'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2, Filter } from 'lucide-react';

interface BookingRequest {
  _id: string;
  venueId: {
    _id: string;
    name: string;
    rentPrice: number;
  };
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  organizerType: string;
  eventName: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  expectedAttendees: number;
  purpose: string;
  status: string;
  rentAmount: number;
  requestDate: string;
  rejectionReason?: string;
}

export default function VenueRequestsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch booking requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`/api/admin/venue-requests?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized. Please log in again.');
          localStorage.removeItem('adminToken');
        } else {
          setError('Failed to load venue requests');
        }
        return;
      }

      const data = await response.json();
      setRequests(data.bookingRequests);
      setError(null);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch venue requests');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests
  const filterRequests = () => {
    let filtered = requests;

    if (filter !== 'all') {
      filtered = filtered.filter((request) => request.status === filter);
    }

    setFilteredRequests(filtered);
  };

  useEffect(() => {
    fetchRequests();
    setIsPageLoading(false);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filter]);

  // Handle approve
  const handleApprove = async (requestId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/venue-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        alert('Booking request approved! Organizer can now proceed with payment.');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  // Handle reject
  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/venue-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason,
        }),
      });

      if (response.ok) {
        alert('Booking request rejected.');
        setRejectingId(null);
        setRejectionReason('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'payment_pending':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'approved':
      case 'payment_pending':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
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
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Venue Booking Requests</h1>
                <p className="text-zinc-400 mt-2">Manage and approve venue booking requests from organizers</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-4 mb-6 flex-wrap">
                {['pending', 'payment_pending', 'approved', 'completed', 'rejected'].map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? 'default' : 'outline'}
                    onClick={() => setFilter(status)}
                    className={
                      filter === status
                        ? 'bg-[#e78a53] hover:bg-[#e78a53]/90 text-white'
                        : 'border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
                    }
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </Button>
                ))}
              </div>

              {/* Requests List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#e78a53]" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-8 text-center">
                      <p className="text-zinc-400">No booking requests found</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredRequests.map((request) => (
                    <Card key={request._id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden">
                      <CardHeader className="bg-zinc-800/50 pb-3 border-b border-zinc-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white">{request.eventName}</CardTitle>
                            <CardDescription className="text-zinc-400 mt-1">
                              {request.venueId.name} • {new Date(request.eventDate).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-zinc-400">Organizer</p>
                              <p className="font-semibold text-white">{request.organizerName}</p>
                              <p className="text-sm text-zinc-400">{request.organizerEmail}</p>
                              <p className="text-sm text-zinc-400">{request.organizerPhone}</p>
                            </div>

                            <div>
                              <p className="text-sm text-zinc-400">Event Details</p>
                              <p className="text-sm text-zinc-300">
                                <strong>Date:</strong> {new Date(request.eventDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-zinc-300">
                                <strong>Time:</strong> {request.eventStartTime} - {request.eventEndTime}
                              </p>
                              <p className="text-sm text-zinc-300">
                                <strong>Expected Attendees:</strong> {request.expectedAttendees}
                              </p>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-zinc-400">Venue & Purpose</p>
                              <p className="text-sm text-zinc-300">
                                <strong>Purpose:</strong> {request.purpose}
                              </p>
                              <p className="text-sm text-zinc-300">
                                <strong>Rent Amount:</strong> <span className="text-[#e78a53]">₹{request.rentAmount}</span>
                              </p>
                            </div>

                            {request.rejectionReason && (
                              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded">
                                <p className="text-sm text-red-400">
                                  <strong>Rejection Reason:</strong> {request.rejectionReason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {request.status === 'pending' && (
                          <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-3 flex-wrap">
                            <Button
                              onClick={() => handleApprove(request._id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>

                            {rejectingId === request._id ? (
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Rejection reason..."
                                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleReject(request._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRejectingId(null);
                                    setRejectionReason('');
                                  }}
                                  className="border-zinc-700 text-zinc-300"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() => setRejectingId(request._id)}
                                className="border-zinc-700 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            )}
                          </div>
                        )}
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
