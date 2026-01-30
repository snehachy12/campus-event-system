import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/db";
import Event from '@/lib/createevent';
import mongoose from 'mongoose';

import User from '@/lib/user';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const persona = searchParams.get('persona');

    if (!userId) {
      return NextResponse.json({ error: "Organizer ID is required" }, { status: 400 });
    }

    // Check user role and approval
    const user = await User.findById(userId);
    if (!user || user.role !== 'organizer' || !(user.roleRequestStatus === 'approved' || user.isApproved)) {
      return NextResponse.json({ error: "Unauthorized: Not an approved organizer" }, { status: 403 });
    }
    if (persona !== 'organizer') {
      return NextResponse.json({ error: "Persona must be organizer" }, { status: 403 });
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