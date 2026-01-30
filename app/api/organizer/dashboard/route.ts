import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import Event from '@/lib/event';
import Booking from '@/lib/booking'; // Assuming you have a Booking model
import mongoose from 'mongoose';

import User from '@/lib/user';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const persona = searchParams.get('persona');

    if (!userId) {
      return NextResponse.json({ error: 'Organizer ID required' }, { status: 400 });
    }

    // Check user role and approval
    const user = await User.findById(userId);
    if (!user || user.role !== 'organizer' || !(user.roleRequestStatus === 'approved' || user.isApproved)) {
      return NextResponse.json({ error: "Unauthorized: Not an approved organizer" }, { status: 403 });
    }
    if (persona !== 'organizer') {
      return NextResponse.json({ error: "Persona must be organizer" }, { status: 403 });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch Events by Organizer
    const events = await Event.find({ organizer: objectId });
    const eventIds = events.map(e => e._id);

    // 2. Aggregate Total Stats (Revenue & Tickets)
    const totalStats = await Booking.aggregate([
      { $match: { eventId: { $in: eventIds }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTickets: { $sum: 1 } // Assuming 1 doc = 1 ticket
        }
      }
    ]);

    // 3. Aggregate Monthly Revenue Trend (For Line Chart)
    const revenueTrend = await Booking.aggregate([
      { $match: { eventId: { $in: eventIds }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: '$amount' },
          tickets: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 } // Last 7 days
    ]);

    // 4. Aggregate Event Performance (For Bar Chart)
    // Group bookings by Event ID to see which event is selling best
    const eventPerformance = await Booking.aggregate([
        { $match: { eventId: { $in: eventIds }, paymentStatus: 'paid' } },
        {
            $group: {
                _id: "$eventId",
                ticketSales: { $sum: 1 },
                revenue: { $sum: "$amount" }
            }
        },
        { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'eventInfo' } },
        { $unwind: "$eventInfo" },
        { $project: { name: "$eventInfo.title", ticketSales: 1, revenue: 1 } },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
    ]);

    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter((e: any) => e.status === 'published').length,
      totalRevenue: totalStats[0]?.totalRevenue || 0,
      totalTicketsSold: totalStats[0]?.totalTickets || 0,
    };

    return NextResponse.json({ 
        success: true, 
        stats, 
        charts: {
            revenueTrend: revenueTrend.map((item: any) => ({ date: item._id, revenue: item.revenue })),
            eventPerformance: eventPerformance
        }
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}