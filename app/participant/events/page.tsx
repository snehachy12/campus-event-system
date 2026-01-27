"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Clock } from "lucide-react";

// --- Mock Data for Testing (Replace with real API fetch later) ---
const MOCK_EVENT = {
  _id: "evt-123",
  title: "Annual Tech Symposium 2026",
  fee: 499,
  startDate: "2026-03-15",
  venue: "Grand Hall, Main Campus",
  time: "10:00 AM"
};

const MOCK_STUDENT = {
  _id: "std-007",
  firstName: "Rahul",
  lastName: "Sharma",
  email: "rahul@example.com",
  phone: "9999999999"
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");

  // In a real app, you would fetch the event details using eventId here
  const event = MOCK_EVENT; 
  const student = MOCK_STUDENT; 

  const handleBooking = async () => {
    setLoading(true);

    try {
      // 1. Call your Backend API
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          studentPhone: student.phone,
          eventId: eventId, // From URL
          attendeeCount: 1,
          paymentMethod: paymentMethod,
          totalAmount: event.fee,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Booking failed");

      // 2. Handle Payment Flow
      if (paymentMethod === "online" && data.razorpayOrder) {
        openRazorpay(data.razorpayOrder, data.booking.bookingId);
      } else {
        alert("Booking Confirmed!");
        router.push(`/ticket?id=${data.booking._id}`);
      }

    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const openRazorpay = (order: any, bookingId: string) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
      amount: order.amount,
      currency: order.currency,
      name: "Ace Campus Events",
      description: `Booking for ${event.title}`,
      order_id: order.id,
      handler: async function (response: any) {
        alert("Payment Successful!");
        router.push(`/ticket?id=${bookingId}`);
      },
      prefill: {
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        contact: student.phone,
      },
      theme: { color: "#3399cc" },
    };

    const rzp1 = new (window as any).Razorpay(options);
    rzp1.open();
    
    rzp1.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
        setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Event Details */}
        <div className="md:w-1/2 bg-blue-600 p-8 text-white flex flex-col justify-between">
          <div>
            <span className="bg-blue-500 px-3 py-1 rounded-full text-xs font-semibold tracking-wider">EVENT BOOKING</span>
            <h1 className="text-3xl font-bold mt-4 mb-2">{event.title}</h1>
            <p className="text-blue-100">Secure your spot for this exclusive event.</p>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase">Date</p>
                <p className="font-semibold">{event.startDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                 <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase">Time</p>
                <p className="font-semibold">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                 <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase">Venue</p>
                <p className="font-semibold">{event.venue}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-blue-500">
             <div className="flex justify-between items-end">
               <span className="text-sm text-blue-200">Total Payable</span>
               <span className="text-4xl font-bold">₹{event.fee}</span>
             </div>
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="md:w-1/2 p-8 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Confirm Details</h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase mb-2 font-bold tracking-wide">Attendee</p>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                    {student.firstName[0]}
                 </div>
                 <div>
                    <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                 </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("online")}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentMethod === "online" 
                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Pay Online
                </button>
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentMethod === "cash" 
                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Pay at Venue
                </button>
              </div>
            </div>

            <Button 
              onClick={handleBooking} 
              disabled={loading} 
              className="w-full h-14 text-lg bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg mt-4"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              {loading ? "Processing..." : `Pay ₹${event.fee} & Book`}
            </Button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              By booking, you agree to our terms & conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}