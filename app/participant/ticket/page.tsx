"use client";

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Download, Loader2, AlertCircle } from "lucide-react";

// --- Types ---
interface TicketData {
  _id: string;
  bookingId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  studentName: string;
  qrCodeDataUrl?: string;
}

function TicketContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('id'); // Get ?id=... from URL

  const [registration, setRegistration] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const ticketRef = useRef<HTMLDivElement>(null);

  // --- Fetch Data from Backend ---
  useEffect(() => {
    if (!ticketId) {
      setError("No Ticket ID provided in URL.");
      setLoading(false);
      return;
    }

    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets?id=${ticketId}`);
        
        if (!response.ok) {
          throw new Error('Ticket not found');
        }

        const data = await response.json();
        setRegistration(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  // --- PDF Download Logic ---
  const downloadTicket = async () => {
    if (!ticketRef.current || !registration) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pageWidth = 297; 
      const pageHeight = 210; 
      const margin = 10;
      
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = margin;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`${registration.eventTitle.replace(/\s+/g, '_')}_Ticket.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // --- Render States ---

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#e78a53]" />
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h1 className="text-xl font-bold">Unable to load ticket</h1>
          <p className="text-gray-400">{error || "Ticket data missing"}</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(registration.eventDate);

  // --- Main Ticket UI ---
  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-screen bg-gray-100">
      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button onClick={downloadTicket} className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* The Ticket Visual */}
      <div className="overflow-auto w-full flex justify-center py-8">
        <div
          ref={ticketRef}
          className="rounded-3xl overflow-hidden shadow-2xl bg-white text-black min-w-[900px]"
          style={{ width: '900px' }}
        >
          <div className="flex h-[340px]">
            {/* Left Side (Event Info) */}
            <div className="flex-1 p-8 bg-gradient-to-br from-indigo-900 to-purple-900 text-white relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] text-[#e78a53]">ACE CAMPUS</h3>
                  <p className="text-[10px] text-indigo-200">Official Event Pass</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold">{registration.bookingId}</h2>
                </div>
              </div>

              <h1 className="text-4xl font-extrabold mb-2 leading-tight">{registration.eventTitle}</h1>
              
              <div className="flex items-end gap-6 mt-8">
                <div>
                  <p className="text-xs text-indigo-300 uppercase mb-1">Date</p>
                  <p className="text-2xl font-bold">{eventDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-300 uppercase mb-1">Time</p>
                  <p className="text-2xl font-bold">{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                 <div>
                  <p className="text-xs text-indigo-300 uppercase mb-1">Venue</p>
                  <p className="text-xl font-bold text-[#e78a53]">{registration.eventVenue}</p>
                </div>
              </div>
              
               {/* Decorative Barcode Line */}
              <div className="absolute bottom-8 left-8 right-8 h-12 bg-white/10 rounded flex items-center px-4">
                 <div className="text-xs text-white/50 tracking-widest font-mono">
                    {registration._id.toUpperCase()}
                 </div>
              </div>
            </div>

            {/* Perforation Line */}
            <div className="w-[2px] bg-gray-900 relative flex flex-col justify-between py-2">
                 {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-[4px] h-[8px] bg-white rounded-full -ml-[1px]" />
                 ))}
            </div>

            {/* Right Side (QR & Stub) */}
            <div className="w-[280px] bg-white p-6 flex flex-col items-center justify-center border-l-2 border-dashed border-gray-300">
               <p className="text-xs font-bold text-gray-400 mb-4 tracking-wider">SCAN TO ENTER</p>
               
               {/* QR Code Container */}
               <div className="bg-white p-2 border-4 border-black rounded-lg mb-4">
                   {registration.qrCodeDataUrl ? (
                       /* Use standard img tag for external QR URLs to avoid Next.js Image domain config issues */
                       <img src={registration.qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
                   ) : (
                       <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                           QR Pending
                       </div>
                   )}
               </div>

               <div className="text-center">
                   <p className="text-xs text-gray-500">Attendee</p>
                   <p className="font-bold text-indigo-900 text-lg">{registration.studentName || "Student"}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component with Suspense ---
// Next.js requires Suspense when using useSearchParams in client components
export default function TicketPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-white">Loading Page...</div>}>
      <TicketContent />
    </Suspense>
  );
}