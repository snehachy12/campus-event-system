"use client";

import { useState, useEffect } from "react";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { UserMenu } from "@/components/user-menu";
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

export default function TeacherBookingRequestsPage() {
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

	return (
		<div className="flex h-screen bg-black overflow-hidden">
			<TeacherSidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="border-b border-zinc-800 bg-black">
					<div className="px-8 py-4 flex items-center justify-between">
						<h1 className="text-2xl font-bold text-white">My Venue Booking Requests</h1>
						<UserMenu />
					</div>
				</header>
				<div className="flex-1 overflow-y-auto">
					<div className="p-8 max-w-7xl mx-auto">
						{/* Filter Tabs */}
						<div className="flex gap-4 mb-6 flex-wrap">
							{['all', 'pending', 'approved', 'payment_pending', 'completed', 'rejected'].map((status) => (
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
									{status === 'all' ? 'ALL' : status.replace('_', ' ').toUpperCase()}
								</Button>
							))}
						</div>

						{loading ? (
							<div className="flex justify-center py-12">
								<span className="text-zinc-400">Loading requests...</span>
							</div>
						) : requests.length === 0 ? (
							<Card className="bg-zinc-900/50 border-zinc-800">
								<CardContent className="p-8 text-center">
									<p className="text-zinc-400 mb-4">No booking requests found</p>
									<a href="/teacher/venues">
										<Button className="bg-[#e78a53] hover:bg-[#e78a53]/90">Browse Venues</Button>
									</a>
								</CardContent>
							</Card>
						) : (
							<div className="space-y-4">
								{requests.map((request) => (
									<Card key={request._id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
										<CardHeader className="bg-zinc-800/50 pb-3 border-b border-zinc-800">
											<div className="flex justify-between items-start">
												<div>
													<CardTitle className="text-white text-lg">{request.eventName}</CardTitle>
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
														<p className="text-sm text-zinc-300">
															<strong>Purpose:</strong> {request.purpose}
														</p>
													</div>
												</div>
												{/* Right Column */}
												<div className="space-y-3">
													<div>
														<p className="text-sm text-zinc-400">Venue & Payment</p>
														<p className="text-sm text-zinc-300">
															<strong>Venue:</strong> {request.venueId.name}
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
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
