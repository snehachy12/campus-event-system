import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import Event from '@/lib/createevent';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    // Filters
    const type = searchParams.get('type'); // e.g. "workshop", "cultural"
    const limit = parseInt(searchParams.get('limit') || '0');

    // Build Query
    const query: any = {
      status: 'published' // Only show published events to students
    };

    if (type) {
      query.eventType = type;
    }

    // Fetch from DB
    let eventQuery = Event.find(query)
      .sort({ startDate: 1 }) // Show nearest upcoming events first
      .populate('organizer', 'name organizationName'); // Get organizer details

    if (limit > 0) {
      eventQuery = eventQuery.limit(limit);
    }

    const events = await eventQuery;

    return NextResponse.json({ 
      success: true, 
      events 
    });

  } catch (error: any) {
    console.error("Fetch Events Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}