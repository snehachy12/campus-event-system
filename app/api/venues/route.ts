import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { VenueBookingRequestModel, VenueModel } from "@/lib/models";
import jwt from "jsonwebtoken";

// Middleware to verify user (student or teacher as organizer)
const verifyUser = (request: NextRequest) => {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    return decoded;
  } catch {
    return null;
  }
};

// POST - Create a venue booking request
export async function POST(request: NextRequest) {
  try {
    const user = verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers and students/teachers can request venues
    // For organizers, they must be approved and using organizer persona
    if (user.role === 'organizer') {
      const persona = request.headers.get('x-persona');
      if (persona !== 'organizer') {
        return NextResponse.json(
          { error: "Must use organizer persona to request venues as organizer" },
          { status: 403 }
        );
      }
      // Organizer approval check would be done in the frontend before making request
    } else if (!["student", "teacher"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only students, teachers, and approved organizers can request venues" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { venueId } = body;

    const {
      eventName,
      eventDescription,
      eventDate,
      eventStartTime,
      eventEndTime,
      expectedAttendees,
      purpose,
      specialRequirements,
      organizerName,
      organizerEmail,
      organizerPhone,
    } = body;

    // Log for debugging
    console.log('Booking request received:', {
      venueId,
      eventName,
      eventDescription,
      eventDate,
      eventStartTime,
      eventEndTime,
      expectedAttendees,
      purpose,
      organizerName,
      organizerEmail,
      organizerPhone,
    });

    // Validation - only check for truly required fields
    if (
      !venueId ||
      !eventName ||
      !eventDescription ||
      !eventDate ||
      !eventStartTime ||
      !eventEndTime ||
      expectedAttendees === undefined ||
      expectedAttendees === null ||
      expectedAttendees === '' ||
      !purpose ||
      !organizerName ||
      !organizerEmail
    ) {
      const missingFields = [];
      if (!venueId) missingFields.push('venueId');
      if (!eventName) missingFields.push('eventName');
      if (!eventDescription) missingFields.push('eventDescription');
      if (!eventDate) missingFields.push('eventDate');
      if (!eventStartTime) missingFields.push('eventStartTime');
      if (!eventEndTime) missingFields.push('eventEndTime');
      if (expectedAttendees === undefined || expectedAttendees === null || expectedAttendees === '') missingFields.push('expectedAttendees');
      if (!purpose) missingFields.push('purpose');
      if (!organizerName) missingFields.push('organizerName');
      if (!organizerEmail) missingFields.push('organizerEmail');

      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if venue exists
    const venue = await VenueModel.findById(venueId);
    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    // Check if expected attendees exceed venue capacity
    if (expectedAttendees > venue.capacity) {
      return NextResponse.json(
        { error: `Expected attendees cannot exceed venue capacity of ${venue.capacity}` },
        { status: 400 }
      );
    }

    // Check for conflicting bookings (same venue, overlapping dates)
    const existingBooking = await VenueBookingRequestModel.findOne({
      venueId,
      eventDate: new Date(eventDate),
      status: { $in: ["approved", "payment_pending"] },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Venue is already booked for this date" },
        { status: 409 }
      );
    }

    // Create booking request
    const newBookingRequest = new VenueBookingRequestModel({
      venueId,
      organizerId: user.id,
      organizerType: user.role,
      organizerName,
      organizerEmail,
      organizerPhone,
      eventName,
      eventDescription,
      eventDate: new Date(eventDate),
      eventStartTime,
      eventEndTime,
      expectedAttendees,
      purpose,
      specialRequirements,
      rentAmount: venue.rentPrice,
      status: "pending",
    });

    await newBookingRequest.save();

    return NextResponse.json(
      {
        success: true,
        message: "Venue booking request created successfully",
        bookingRequest: newBookingRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking request:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create booking request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get all available venues
export async function GET(request: NextRequest) {
  try {
    const user = verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get only active venues
    const venues = await VenueModel.find({ status: "active" })
      .sort({ createdAt: -1 });

    console.log(`Found ${venues.length} active venues`);

    return NextResponse.json(
      {
        success: true,
        venues,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
