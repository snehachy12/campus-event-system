'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle, CreditCard, Bell } from 'lucide-react';
import { OrganizerSidebar } from '@/components/organizer-sidebar';
import { UserMenu } from '@/components/user-menu';

interface BookingRequest {
  _id: string;
  venueId: {
    _id: string;
    name: string;
    rentPrice: number;
  };
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
  razorpayOrderId?: string;
  paymentStatus?: string;
}

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
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

  // Fetch booking requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/organizer/bookings${filter !== 'all' ? `?status=${filter}` : ''}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'x-persona': 'organizer'
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching bookings:', errorData);
        return;
      }

      const data = await response.json();
      console.log('Fetched booking requests:', data);
      setRequests(data.bookingRequests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  // Handle payment
  const handlePayment = async (requestId: string, amount: number) => {
    try {
      const token = localStorage.getItem('token');

      // Create Razorpay order
      const response = await fetch('/api/payments/venue-rent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-persona': 'organizer',
        },
        body: JSON.stringify({ bookingRequestId: requestId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to initiate payment');
        return;
      }

      const data = await response.json();
      const options = {
        key: data.order.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Campus Event System',
        description: 'Venue Rent Payment',
        order_id: data.order.id,
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/venue-rent', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'x-persona': 'organizer',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingRequestId: requestId,
            }),
          });

          if (verifyResponse.ok) {
            alert('Payment successful! Your venue booking is confirmed.');
            fetchRequests();
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          email: localStorage.getItem('userEmail'),
          contact: localStorage.getItem('userPhone'),
        },
        theme: {
          color: '#2563eb',
        },
      };

      const Razorpay = (window as any).Razorpay;
      if (Razorpay) {
        const rzp = new Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay script not loaded');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'payment_pending':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'approved':
      case 'payment_pending':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <OrganizerSidebar />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Booking Requests</h1>
            <p className="text-zinc-400 text-sm">Track and manage your venue booking requests</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-zinc-400" /></Button>
            <UserMenu />
          </div>
        </header>

        <div className="p-8">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'pending', 'payment_pending', 'completed', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                className={filter === status ? 'bg-[#e78a53] hover:bg-[#e78a53]/90 text-white border-0' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'}
              >
                {status === 'all' ? 'ALL' : status.replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <Card className="text-center py-12 bg-zinc-900/50 border-zinc-800">
              <CardContent>
                <p className="text-zinc-400 mb-4">No booking requests found</p>
                <a href="/organizer/venues">
                  <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">Browse Venues</Button>
                </a>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request._id} className="overflow-hidden bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="bg-zinc-800/50 pb-3 border-b border-zinc-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white">{request.eventName}</CardTitle>
                        <CardDescription className="text-zinc-400">
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
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-zinc-400">Event Details</p>
                          <p className="text-sm text-zinc-300">
                            <strong className="text-white">Date:</strong> {new Date(request.eventDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-zinc-300">
                            <strong className="text-white">Time:</strong> {request.eventStartTime} - {request.eventEndTime}
                          </p>
                          <p className="text-sm text-zinc-300">
                            <strong className="text-white">Expected Attendees:</strong> {request.expectedAttendees}
                          </p>
                          <p className="text-sm text-zinc-300">
                            <strong className="text-white">Purpose:</strong> {request.purpose}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-zinc-400">Requested On</p>
                          <p className="text-sm text-zinc-300">{new Date(request.requestDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-zinc-400">Venue & Cost</p>
                          <p className="text-sm text-zinc-300">
                            <strong className="text-white">Venue:</strong> {request.venueId.name}
                          </p>
                          <p className="text-lg font-semibold text-[#e78a53]">₹{request.rentAmount}</p>
                        </div>

                        {request.rejectionReason && (
                          <div className="bg-red-500/10 p-3 rounded border border-red-500/30">
                            <p className="text-sm text-red-400">
                              <strong>Rejection Reason:</strong> {request.rejectionReason}
                            </p>
                          </div>
                        )}

                        {request.status === 'payment_pending' && (
                          <div className="bg-blue-500/10 p-3 rounded border border-blue-500/30">
                            <p className="text-sm text-blue-400">
                              ✓ Approved! Proceed with payment to confirm your booking.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {request.status === 'payment_pending' && (
                      <div className="mt-6 pt-4 border-t border-zinc-700">
                        <Button
                          onClick={() => handlePayment(request._id, request.rentAmount)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now (₹{request.rentAmount})
                        </Button>
                      </div>
                    )}

                    {request.status === 'completed' && (
                      <div className="mt-6 pt-4 border-t border-zinc-700">
                        <div className="bg-green-500/10 p-3 rounded border border-green-500/30">
                          <p className="text-sm text-green-400">
                            ✓ Payment confirmed! Your venue is booked. You can now proceed to create your event.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
