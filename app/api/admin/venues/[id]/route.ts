import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { VenueModel } from "@/lib/models";
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

// PUT - Update a venue
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid venue ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Find and update venue
    const updatedVenue = await VenueModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedVenue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Venue updated successfully",
        venue: updatedVenue,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating venue:", error);
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a venue
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid venue ID" },
        { status: 400 }
      );
    }

    const deletedVenue = await VenueModel.findByIdAndDelete(id);

    if (!deletedVenue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Venue deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting venue:", error);
    return NextResponse.json(
      { error: "Failed to delete venue" },
      { status: 500 }
    );
  }
}
