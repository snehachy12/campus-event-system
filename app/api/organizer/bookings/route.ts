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

// GET - Get organizer's booking requests
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build filter object
    const filter: any = {
      organizerId: user.id,
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
        bookingRequests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking requests" },
      { status: 500 }
    );
  }
}
