import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { VenueBookingRequestModel } from "@/lib/models";
import jwt from "jsonwebtoken";

// Middleware to verify user
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

// GET - Get student's booking requests
export async function GET(request: NextRequest) {
  try {
    const user = verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Students and teachers can access their booking requests (for venue bookings)
    const allowedRoles = ["student", "teacher"];
    if (!allowedRoles.includes(user.role)) {
      console.error(`Access denied for role: ${user.role}`);
      return NextResponse.json(
        { error: `Only students and teachers can access this endpoint. Current role: ${user.role}` },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build filter object - get bookings created by this user
    const filter: any = {
      organizerId: user.id,
      organizerType: user.role, // Can be student or teacher
    };

    if (status) {
      filter.status = status;
    }

    const bookingRequests = await VenueBookingRequestModel.find(filter)
      .populate("venueId")
      .sort({ requestDate: -1 });

    return NextResponse.json(
      {
        success: true,
        bookingRequests: bookingRequests || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching booking requests:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch booking requests",
        bookingRequests: []
      },
      { status: 200 }
    );
  }
}
