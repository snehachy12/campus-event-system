import { NextResponse } from 'next/server';

// TYPE DEFINITION (Matches your DB schema)
interface TicketData {
  _id: string;
  bookingId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  studentName: string;
  qrCodeDataUrl?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get('id');

  if (!ticketId) {
    return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
  }

  try {
 
    const mockDbResponse: TicketData = {
      _id: ticketId, // Returning the requested ID to prove it works
      bookingId: `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      eventTitle: "Annual Tech Symposium 2024",
      eventDate: new Date().toISOString(), // Current date
      eventVenue: "Grand Hall, Ace Campus",
      studentName: "Alex Johnson",
      // Using a public API to generate a real QR code for visual proof
      qrCodeDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketId}`
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(mockDbResponse);

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}