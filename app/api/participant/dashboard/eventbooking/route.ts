import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { EventBookingModel } from "@/lib/event-model";
import { EventModel } from "@/lib/models";
import { createRazorpayOrder } from "@/lib/razorpay";
import QRCode from "qrcode";

// Force Node.js runtime for QR generation buffers
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch bookings
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const bookingId = searchParams.get('bookingId'); // Added ability to fetch single ticket
    const eventId = searchParams.get('eventId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: any = {};
    if (studentId) query.studentId = studentId;
    if (eventId) query.eventId = eventId;
    // Allow fetching a specific ticket by ID (Used by the Ticket Page)
    if (bookingId) query._id = bookingId; 

    const skip = (page - 1) * limit;
    
    const bookings = await EventBookingModel.find(query)
      .populate('eventId', 'title startDate venue eventType organizer')
      .populate('studentId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EventBookingModel.countDocuments(query);

    // Calculate Stats (Only if fetching all/admin view)
    let stats = {};
    if (!studentId && !bookingId) {
        const totalBookings = await EventBookingModel.countDocuments({});
        const totalRevenue = await EventBookingModel.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        stats = {
            totalBookings,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
        };
    }

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error: any) {
    console.error("Error fetching event bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create new event booking
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const bookingData = await request.json();

    const {
      studentId,
      studentName,
      studentEmail,
      studentPhone,
      eventId,
      attendeeCount = 1,
      paymentMethod,
      specialRequirements,
      totalAmount
    } = bookingData;

    // 1. Validation
    if (!studentId || !studentName || !studentEmail || !eventId || !paymentMethod || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 2. Check for Duplicate Booking
    const existingBooking = await EventBookingModel.findOne({
      studentId,
      eventId,
      bookingStatus: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 });
    }

    // 3. Generate IDs
    // Ensure generateBookingId is defined in your Schema logic, otherwise use a UUID here
    const bookingId = (typeof EventBookingModel.generateBookingId === 'function') 
        ? await EventBookingModel.generateBookingId() 
        : `BK-${Date.now()}`;

    // 4. Generate QR Code Data
    // We embed the booking ID and Student Name into the QR code
    const qrPayload = JSON.stringify({
        bid: bookingId,
        sid: studentId,
        evt: eventId
    });
    
    // Generate Base64 QR Image
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    // 5. Create Booking Object
    const newBooking = new EventBookingModel({
      bookingId,
      studentId,
      studentName,
      studentEmail,
      studentPhone: studentPhone || '',
      eventId,
      eventTitle: event.title,
      eventDate: event.startDate,
      eventVenue: event.venue,
      attendeeCount,
      totalAmount,
      paymentMethod,
      specialRequirements: specialRequirements || '',
      qrCodeDataUrl, // <--- IMPORTANT: Save this to DB so GET requests can return it
      statusHistory: [{
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Booking created'
      }]
    });

    // 6. Handle Payment Integration
    let razorpayOrder = null;
    if (paymentMethod === 'online') {
      razorpayOrder = await createRazorpayOrder(totalAmount, bookingId, studentEmail);
      newBooking.razorpayOrderId = razorpayOrder.id;
      newBooking.paymentStatus = 'pending'; // Default to pending for online
    } else {
      newBooking.paymentStatus = 'paid'; // Assumes cash/free is instantly paid
    }

    await newBooking.save();

    return NextResponse.json({
      message: "Booking created successfully",
      booking: newBooking,
      qrCodeUrl: qrCodeDataUrl, 
      razorpayOrder: razorpayOrder
    });

  } catch (error: any) {
    console.error("Error creating event booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

// PUT - Update booking
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    
    if (!bookingId) return NextResponse.json({ error: "Booking ID required" }, { status: 400 });

    const updateData = await request.json();
    
    const updatedBooking = await EventBookingModel.findOneAndUpdate(
      { bookingId },
      updateData,
      { new: true }
    );

    if (!updatedBooking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    return NextResponse.json({ message: "Updated successfully", booking: updatedBooking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Cancel booking
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const reason = searchParams.get('reason') || 'Cancelled by user';
    
    if (!bookingId) return NextResponse.json({ error: "Booking ID required" }, { status: 400 });

    const booking = await EventBookingModel.findOne({ bookingId });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    // Ensure your model supports this method, or push to the array manually
    if (booking.statusHistory) {
        booking.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: reason });
    }

    await booking.save();

    return NextResponse.json({ message: "Cancelled successfully", booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}