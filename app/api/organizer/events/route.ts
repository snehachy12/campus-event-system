import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import Event from '@/lib/createevent';
import User from '@/lib/user';

export async function POST(request: Request) {
  try {
    await connectToDatabase ();
    const body = await request.json();
    const { userId, ...eventData } = body;

    if (!userId) {
      return NextResponse.json({ error: "Organizer ID is missing" }, { status: 400 });
    }

    // Verify user is an organizer
    const user = await User.findById(userId);
    if (!user || user.role !== 'organizer') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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