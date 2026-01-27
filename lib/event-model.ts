import mongoose, { Schema, models, model, Document, Model } from "mongoose";
import crypto from "crypto";

// 1. Define TypeScript Interface
export interface IEventBooking extends Document {
  bookingId: string;
  ticketSecret: string; // <--- NEW: For secure QR codes
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  eventDate: Date;
  eventVenue: string;
  registrationDate: Date;
  attendeeCount: number;
  totalAmount: number;
  paymentMethod: 'online' | 'offline';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  bookingStatus: 'confirmed' | 'cancelled' | 'attended' | 'no-show';
  specialRequirements?: string;
  cancellationReason?: string;
  cancelledBy?: 'student' | 'admin' | 'system';
  cancelledAt?: Date;
  statusHistory: { status: string; timestamp: Date; note?: string }[];
  receiptGenerated: boolean;
  confirmationEmailSent: boolean;
  checkedInAt?: Date;
  checkedInBy?: string;
  
  // Methods
  addStatusHistory(status: string, note?: string): void;
}

// 2. Define Static Methods Interface
interface IEventBookingModel extends Model<IEventBooking> {
  generateBookingId(): Promise<string>;
}

const EventBookingSchema = new Schema<IEventBooking>(
  {
    bookingId: { type: String, required: true, unique: true },
    
    // NEW: Random secret for QR code security
    ticketSecret: { 
      type: String, 
      default: () => crypto.randomBytes(8).toString("hex") // Generates random string like "a1b2c3d4"
    },

    // Student Information
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentPhone: { type: String, required: true },
    
    // Event Information
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventVenue: { type: String, required: true },
    
    // Booking Details
    registrationDate: { type: Date, default: Date.now },
    attendeeCount: { type: Number, default: 1, min: 1 },
    
    // Payment Information
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['online', 'offline'], required: true },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded'], 
      default: 'pending' 
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    
    // Booking Status
    bookingStatus: { 
      type: String, 
      enum: ['confirmed', 'cancelled', 'attended', 'no-show'], 
      default: 'confirmed' 
    },
    
    // Additional Information
    specialRequirements: { type: String },
    
    // Cancellation
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['student', 'admin', 'system'] },
    cancelledAt: { type: Date },
    
    // Tracking
    statusHistory: [{
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String }
    }],
    
    // Receipt and confirmation
    receiptGenerated: { type: Boolean, default: false },
    confirmationEmailSent: { type: Boolean, default: false },
    
    // Check-in information
    checkedInAt: { type: Date },
    checkedInBy: { type: String }
  },
  { timestamps: true }
);

// Indexes
EventBookingSchema.index({ studentId: 1, createdAt: -1 });
EventBookingSchema.index({ eventId: 1, createdAt: -1 });
EventBookingSchema.index({ bookingId: 1 });
EventBookingSchema.index({ ticketSecret: 1 }); // Index for fast QR lookups
EventBookingSchema.index({ bookingStatus: 1 });
EventBookingSchema.index({ paymentStatus: 1 });
EventBookingSchema.index({ razorpayOrderId: 1 });

// Method to add status to history
EventBookingSchema.methods.addStatusHistory = function(status: string, note?: string) {
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    note
  });
  this.bookingStatus = status as any;
};

// Method to generate booking ID
EventBookingSchema.statics.generateBookingId = async function() {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  const bookingNumber = (count + 1).toString().padStart(4, '0');
  return `EVT-${year}-${bookingNumber}`;
};

export const EventBookingModel = (models.EventBooking as IEventBookingModel) || model<IEventBooking, IEventBookingModel>("EventBooking", EventBookingSchema);