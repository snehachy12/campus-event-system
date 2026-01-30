'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentSidebar } from '@/components/student-sidebar';
import { UserMenu } from '@/components/user-menu';
import { CheckCircle, XCircle, Clock, AlertCircle, Bell, MapPin, Calendar, Users } from 'lucide-react';

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
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Clock },
  approved: { bg: 'bg-green-500/10', text: 'text-green-400', icon: CheckCircle },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
  payment_pending: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: AlertCircle },
};

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/student/booking-requests${filter !== 'all' ? `?status=${filter}` : ''}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data.bookingRequests || []);
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

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Booking Requests</h1>
            <p className="text-zinc-400 text-sm">Track your venue booking requests</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-zinc-400" /></Button>
            <UserMenu />
          </div>
        </header>

        <div className="p-8">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'pending', 'approved', 'payment_pending', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
                className={filter === status ? 'bg-[#e78a53]' : 'border-zinc-700'}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </Button>
            ))}
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-zinc-700 border-t-[#e78a53] rounded-full"></div>
              </div>
            ) : requests.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <p className="text-zinc-400">No booking requests found.</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => {
                const statusConfig = statusColors[request.status] || statusColors.pending;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card key={request._id} className="bg-zinc-900/50 border-zinc-800 hover:border-[#e78a53]/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-white">{request.eventName}</h3>
                            <Badge className={statusConfig.bg}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-sm">
                              <p className="text-zinc-500 mb-1">Venue</p>
                              <p className="text-white font-medium">{request.venueId?.name || 'N/A'}</p>
                            </div>
                            <div className="text-sm">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <Calendar className="h-4 w-4" />
                                Event Date
                              </div>
                              <p className="text-white font-medium">
                                {new Date(request.eventDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-sm">
                              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <Users className="h-4 w-4" />
                                Attendees
                              </div>
                              <p className="text-white font-medium">{request.expectedAttendees}</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-zinc-500 mb-1">Rent Amount</p>
                              <p className="text-white font-medium">₹{request.rentAmount?.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="text-sm text-zinc-400 mb-3">
                            <p><span className="text-zinc-500">Purpose:</span> {request.purpose}</p>
                            <p><span className="text-zinc-500">Time:</span> {request.eventStartTime} - {request.eventEndTime}</p>
                            <p><span className="text-zinc-500">Requested:</span> {new Date(request.requestDate).toLocaleDateString()}</p>
                          </div>

                          {request.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                              <p className="font-semibold mb-1">Rejection Reason:</p>
                              <p>{request.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
