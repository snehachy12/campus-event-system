import { NextResponse } from 'next/server';

// --- Types ---
type User = {
  id: string;
  name: string;
  avatar: string;
  role: 'organizer' | 'participant';
};

type Group = {
  id: string;
  name: string;
  eventId: string;
  participants: User[];
  createdAt: string;
};

type Message = {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  type: 'text' | 'link-card';
  time: string; // ISO string
  user?: User; // Joined for frontend convenience
};

// --- Mock Database (In-Memory) ---
// Note: In production, replace this with Prisma, Mongoose, or SQL calls.
declare global {
  var mockDb: {
    groups: Group[];
    messages: Message[];
  };
}

if (!global.mockDb) {
  global.mockDb = {
    groups: [],
    messages: [
      // Initial mock message
      {
        id: 'm1',
        groupId: 'default-event',
        userId: 'u2',
        content: 'Hi everyone! Really excited for this event. 🙏',
        type: 'text',
        time: new Date().toISOString(),
      }
    ],
  };
}

// Helper to simulate DB delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- GET: Fetch Messages or Groups ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const groupId = searchParams.get('groupId');

  await delay(300); // Simulate network latency

  // 1. Get Messages for a specific group
  if (action === 'get_messages' && groupId) {
    const groupMessages = global.mockDb.messages.filter(m => m.groupId === groupId);
    
    // Sort by time
    groupMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return NextResponse.json({ success: true, data: groupMessages });
  }

  // 2. Get Group Details
  if (action === 'get_group' && groupId) {
    const group = global.mockDb.groups.find(g => g.id === groupId);
    return NextResponse.json({ success: true, data: group || null });
  }

  return NextResponse.json({ success: false, error: 'Invalid action or missing params' }, { status: 400 });
}

// --- POST: Create Group or Send Message ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    await delay(300);

    // 1. Create a New Group (Event Chat)
    if (action === 'create_group') {
      const { name, eventId, organizer } = body;

      if (!name || !eventId) {
        return NextResponse.json({ error: 'Missing name or eventId' }, { status: 400 });
      }

      const newGroup: Group = {
        id: crypto.randomUUID(),
        name,
        eventId,
        participants: [organizer], // Add creator as first participant
        createdAt: new Date().toISOString(),
      };

      global.mockDb.groups.push(newGroup);

      return NextResponse.json({ 
        success: true, 
        message: 'Group created successfully', 
        data: newGroup 
      });
    }

    // 2. Send a Message
    if (action === 'send_message') {
      const { groupId, user, content, type = 'text', cardData } = body;

      if (!groupId || !user || !content) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const newMessage: Message = {
        id: crypto.randomUUID(),
        groupId,
        userId: user.id,
        content,
        type,
        time: new Date().toISOString(),
        // storing user object directly for mock simplicity
        user: user, 
        // @ts-ignore - simulating card data attachment if needed
        cardData: cardData || null 
      };

      global.mockDb.messages.push(newMessage);

      return NextResponse.json({ 
        success: true, 
        message: 'Message sent', 
        data: newMessage 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}