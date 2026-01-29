import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import {
  VenueBookingRequestModel,
  VenueRentPaymentModel,
} from "@/lib/models";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

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

// POST - Create Razorpay order for venue rent payment
export async function POST(request: NextRequest) {
  try {
    const user = verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { bookingRequestId } = body;

    // Validate booking request ID
    if (!mongoose.Types.ObjectId.isValid(bookingRequestId)) {
      return NextResponse.json(
        { error: "Invalid booking request ID" },
        { status: 400 }
      );
    }

    // Find the booking request
    const bookingRequest = await VenueBookingRequestModel.findById(
      bookingRequestId
    ).populate("venueId");

    if (!bookingRequest) {
      return NextResponse.json(
        { error: "Booking request not found" },
        { status: 404 }
      );
    }

    // Check if user is the organizer
    if (bookingRequest.organizerId.toString() !== user.id) {
      return NextResponse.json(
        { error: "You can only pay for your own bookings" },
        { status: 403 }
      );
    }

    // Check if booking is approved and payment is pending
    if (bookingRequest.status !== "payment_pending") {
      return NextResponse.json(
        { error: "This booking is not ready for payment. Status: " + bookingRequest.status },
        { status: 400 }
      );
    }

    // Check if payment already exists
    const existingPayment = await VenueRentPaymentModel.findOne({
      bookingRequestId,
      paymentStatus: "completed",
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment for this booking already completed" },
        { status: 400 }
      );
    }

    const amount = bookingRequest.rentAmount;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: `booking_${bookingRequestId}`,
      notes: {
        bookingRequestId: bookingRequestId,
        venueId: bookingRequest.venueId._id.toString(),
        organizerId: user.id,
      },
    });

    // Create payment record in database
    const payment = new VenueRentPaymentModel({
      bookingRequestId,
      venueId: bookingRequest.venueId._id,
      organizerId: user.id,
      amount,
      razorpayOrderId: order.id,
      paymentStatus: "pending",
    });

    await payment.save();

    // Update booking request with payment ID and Razorpay order ID
    bookingRequest.paymentId = payment._id;
    bookingRequest.razorpayOrderId = order.id;
    await bookingRequest.save();

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: process.env.RAZORPAY_KEY_ID,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating payment order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}

// POST - Verify Razorpay payment
export async function PUT(request: NextRequest) {
  try {
    const user = verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingRequestId,
    } = body;

    // Validate inputs
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingRequestId
    ) {
      return NextResponse.json(
        { error: "Missing payment verification details" },
        { status: 400 }
      );
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Find and update payment record
    const payment = await VenueRentPaymentModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment status
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paymentStatus = "completed";
    await payment.save();

    // Update booking request status to approved (payment completed)
    const bookingRequest = await VenueBookingRequestModel.findById(
      bookingRequestId
    );

    if (bookingRequest) {
      bookingRequest.status = "completed";
      bookingRequest.paymentStatus = "completed";
      await bookingRequest.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        payment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
