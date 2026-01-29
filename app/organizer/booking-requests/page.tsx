'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';

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

  // Fetch booking requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/organizer/bookings${filter !== 'all' ? `?status=${filter}` : ''}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data.bookingRequests);
      }
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
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'payment_pending':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Booking Requests</h1>
          <p className="text-gray-600 mt-2">Track and manage your venue booking requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {['all', 'pending', 'payment_pending', 'completed', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className={filter === status ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {status === 'all' ? 'ALL' : status.replace('_', ' ').toUpperCase()}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">No booking requests found</p>
              <a href="/organizer/venues">
                <Button className="bg-blue-600 hover:bg-blue-700">Browse Venues</Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request._id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.eventName}</CardTitle>
                      <CardDescription>
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
                        <p className="text-sm text-gray-600">Event Details</p>
                        <p className="text-sm">
                          <strong>Date:</strong> {new Date(request.eventDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          <strong>Time:</strong> {request.eventStartTime} - {request.eventEndTime}
                        </p>
                        <p className="text-sm">
                          <strong>Expected Attendees:</strong> {request.expectedAttendees}
                        </p>
                        <p className="text-sm">
                          <strong>Purpose:</strong> {request.purpose}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Requested On</p>
                        <p className="text-sm">{new Date(request.requestDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Venue & Cost</p>
                        <p className="text-sm">
                          <strong>Venue:</strong> {request.venueId.name}
                        </p>
                        <p className="text-lg font-semibold text-blue-600">₹{request.rentAmount}</p>
                      </div>

                      {request.rejectionReason && (
                        <div className="bg-red-50 p-3 rounded">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}

                      {request.status === 'payment_pending' && (
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm text-blue-800">
                            ✓ Approved! Proceed with payment to confirm your booking.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'payment_pending' && (
                    <div className="mt-6 pt-4 border-t">
                      <Button
                        onClick={() => handlePayment(request._id, request.rentAmount)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now (₹{request.rentAmount})
                      </Button>
                    </div>
                  )}

                  {request.status === 'completed' && (
                    <div className="mt-6 pt-4 border-t">
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-800">
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
    </div>
  );
}
