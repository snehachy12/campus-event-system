import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import Event from '@/lib/createevent';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "Organizer ID is required" }, { status: 400 });
    }

    // Fetch events created by this user, sorted by newest first
    const events = await Event.find({ organizer: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      events 
    });

  } catch (error: any) {
    console.error("Fetch My Events Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}