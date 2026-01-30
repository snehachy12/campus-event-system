import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import Event from '@/lib/createevent';
import User from '@/lib/user';

export async function POST(request: Request) {
  try {
    await connectToDatabase ();
    const body = await request.json();
    const { userId, persona, ...eventData } = body;

    if (!userId) {
      return NextResponse.json({ error: "Organizer ID is missing" }, { status: 400 });
    }

    // Verify user is an approved organizer with correct persona
    const user = await User.findById(userId);
    if (!user || user.role !== 'organizer' || !(user.roleRequestStatus === 'approved' || user.isApproved)) {
      return NextResponse.json({ error: "Unauthorized: Not an approved organizer" }, { status: 403 });
    }
    if (persona !== 'organizer') {
      return NextResponse.json({ error: "Persona must be organizer" }, { status: 403 });
    }

    const newEvent = await Event.create({
      ...eventData,
      organizer: userId,
      status: 'published' 
    });

    return NextResponse.json({ success: true, event: newEvent });

  } catch (error: any) {
    console.error("Create Event Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}