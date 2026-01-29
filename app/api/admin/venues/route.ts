import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { VenueModel } from "@/lib/models";
import jwt from "jsonwebtoken";

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

// GET - List all venues
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

    const venues = await VenueModel.find({}).sort({ createdAt: -1 });

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

// POST - Create a new venue
export async function POST(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      name,
      description,
      capacity,
      location,
      address,
      amenities,
      rentPrice,
      priceType,
      availability,
      amenitiesDetails,
      images,
      contactPersonName,
      contactPersonPhone,
      contactPersonEmail,
      rules,
    } = body;

    // Validation
    if (
      !name ||
      !description ||
      !capacity ||
      !location ||
      !address ||
      !rentPrice ||
      !availability
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (capacity <= 0 || rentPrice <= 0) {
      return NextResponse.json(
        { error: "Capacity and rent price must be greater than 0" },
        { status: 400 }
      );
    }

    const newVenue = new VenueModel({
      name,
      description,
      capacity,
      location,
      address,
      amenities: amenities || [],
      rentPrice,
      priceType: priceType || "per_day",
      availability: {
        startDate: availability.startDate,
        endDate: availability.endDate,
        operatingHours: availability.operatingHours || {
          start: "09:00",
          end: "18:00",
        },
        blockedDates: availability.blockedDates || [],
      },
      amenitiesDetails: amenitiesDetails || [],
      images: images || [],
      contactPersonName,
      contactPersonPhone,
      contactPersonEmail,
      rules: rules || [],
      status: "active",
    });

    await newVenue.save();

    return NextResponse.json(
      {
        success: true,
        message: "Venue created successfully",
        venue: newVenue,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating venue:", error);
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 }
    );
  }
}
