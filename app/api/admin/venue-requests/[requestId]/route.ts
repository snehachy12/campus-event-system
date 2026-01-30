import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { VenueBookingRequestModel } from "@/lib/models";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Middleware to verify admin
const verifyAdmin = (request: NextRequest) => {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    if (decoded.role !== "admin") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};

// GET - Get all booking requests (admin)
export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const venueId = searchParams.get("venueId");

    // Build filter object
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (venueId) {
      filter.venueId = venueId;
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

// PUT - Approve a booking request
export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { requestId } = params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Find the booking request
    const bookingRequest = await VenueBookingRequestModel.findById(requestId);

    if (!bookingRequest) {
      return NextResponse.json(
        { error: "Booking request not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Set status to 'approved' first
      bookingRequest.status = "approved";
      bookingRequest.approvedBy = admin.adminName || admin.email;
      bookingRequest.approvedAt = new Date();
    } else if (action === "reject") {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }

      bookingRequest.status = "rejected";
      bookingRequest.rejectionReason = rejectionReason;
      bookingRequest.approvedAt = new Date();
    }

    await bookingRequest.save();

    return NextResponse.json(
      {
        success: true,
        message: `Booking request ${action}ed successfully`,
        bookingRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating booking request:", error);
    return NextResponse.json(
      { error: "Failed to update booking request" },
      { status: 500 }
    );
  }
}
