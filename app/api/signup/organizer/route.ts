import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrganizerModel } from "@/lib/models"; // See step 2 below for this
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Updated fields to match your Organizer Frontend
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "phone",
      "organizationName",
      "organizerType",
      "experienceYears",
      "website", 
      // "eventCategories" is an array, we check length below
    ];

    // 1. Check basic required string fields
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // 2. Specific check for arrays (Event Categories)
    if (!body.eventCategories || !Array.isArray(body.eventCategories) || body.eventCategories.length === 0) {
       return NextResponse.json(
          { error: "At least one event category is required" },
          { status: 400 }
       );
    }

    // 3. Check if email already exists
    const existing = await OrganizerModel.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // 4. Hash Password
    const hashed = await bcrypt.hash(body.password, 10);
    body.password = hashed;
    
    // 5. Generate Initials for Avatar
    body.avatarInitials = `${body.firstName?.[0] || ""}${
      body.lastName?.[0] || ""
    }`.toUpperCase();

    // 6. Create the Organizer
    // Ensure numbers are actually stored as numbers if they came in as strings
    const organizerData = {
        ...body,
        experienceYears: Number(body.experienceYears),
        pastEventsCount: Number(body.pastEventsCount || 0),
        averageAttendance: Number(body.averageAttendance || 0),
    };

    const organizer = await OrganizerModel.create(organizerData);
    
    return NextResponse.json({ id: organizer._id, message: "Organizer created successfully" }, { status: 201 });

  } catch (e: any) {
    console.error("Signup Error:", e); // Helpful for debugging
    if (e?.code === 11000) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}