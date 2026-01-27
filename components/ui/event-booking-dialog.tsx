"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Loader2, Calendar, MapPin, Ticket, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog" // This imports the file you shared earlier

// --- Interfaces ---
// These match the data coming from your ParticipantEventsPage
interface Event {
  _id: string
  title: string
  fee: number
  startDate: string
  venue: string
}

interface Student {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  studentId: string
}

interface EventBookingDialogProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  student: Student | null
  onBookingSuccess: (ticketId: string) => void
}

export function EventBookingDialog({ 
  isOpen, 
  onClose, 
  event, 
  student, 
  onBookingSuccess 
}: EventBookingDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("online")

  // Prevent rendering if data is missing
  if (!event || !student) return null

  const handleBooking = async () => {
    setLoading(true)

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
          eventId: event._id,
          attendeeCount: 1,
          paymentMethod: paymentMethod,
          totalAmount: event.fee,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Booking failed")

      // 2. Handle Payment Flow
      if (paymentMethod === "online" && data.razorpayOrder) {
        openRazorpay(data.razorpayOrder, data.booking.bookingId)
      } else {
        // Cash/Free -> Direct Success
        handleSuccess(data.booking._id)
      }

    } catch (error: any) {
      alert(`Booking Error: ${error.message}`)
      setLoading(false)
    }
  }

  const openRazorpay = (order: any, bookingId: string) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
      amount: order.amount,
      currency: order.currency,
      name: "Campus Event",
      description: event.title,
      order_id: order.id,
      handler: function (response: any) {
         handleSuccess(bookingId)
      },
      prefill: {
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        contact: student.phone,
      },
      theme: { color: "#e78a53" },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
    
    rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description)
        setLoading(false)
    })
  }

  const handleSuccess = (ticketId: string) => {
    setLoading(false)
    onClose() 
    onBookingSuccess(ticketId) // Refresh parent page
    router.push(`/ticket?id=${ticketId}`) // Redirect to ticket
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'long', day: 'numeric' 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Load Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-white p-0 gap-0 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 border-b border-zinc-700">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold text-white mb-2">{event.title}</DialogTitle>
            <DialogDescription className="text-zinc-400 flex flex-col gap-1">
               <span className="flex items-center gap-2">
                 <Calendar className="h-4 w-4 text-[#e78a53]" /> 
                 {formatDate(event.startDate)}
               </span>
               <span className="flex items-center gap-2">
                 <MapPin className="h-4 w-4 text-[#e78a53]" /> 
                 {event.venue}
               </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Attendee Info Card */}
          <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
             <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Booking For</p>
                <p className="text-sm font-medium text-white">{student.firstName} {student.lastName}</p>
                <p className="text-xs text-zinc-400">{student.studentId}</p>
             </div>
             <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Ticket className="h-4 w-4" />
             </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("online")}
                className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === "online" 
                  ? "border-[#e78a53] bg-[#e78a53]/10 text-[#e78a53]" 
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <CreditCard className="h-5 w-5" />
                Pay Online
              </button>
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === "cash" 
                  ? "border-[#e78a53] bg-[#e78a53]/10 text-[#e78a53]" 
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <Ticket className="h-5 w-5" />
                Pay at Venue
              </button>
            </div>
          </div>

          {/* Total & Action Button */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-end mb-4">
              <span className="text-zinc-400 text-sm">Total Amount</span>
              <span className="text-2xl font-bold text-white">
                {event.fee > 0 ? `₹${event.fee}` : "Free"}
              </span>
            </div>

            <Button 
              className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white h-12 text-lg"
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                  Processing...
                </>
              ) : (
                event.fee > 0 ? "Pay & Confirm" : "Confirm Registration"
              )}
            </Button>
            <p className="text-center text-[10px] text-zinc-600 mt-3">
              Refunds subject to organizer approval.
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}