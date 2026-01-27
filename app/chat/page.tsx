'use client';

import React from 'react';
import { 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon, 
  Plus,
  Menu,
  Phone,
  Video,
  Crown,        
  ShieldCheck, 
  Users
} from 'lucide-react';

// --- Types ---
type UserRole = 'organizer' | 'participant';

type User = {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  status: 'online' | 'offline' | 'typing';
  lastMessage?: string;
  lastTime?: string;
  unread?: number;
  isCurrentUser?: boolean;
};

type Message = {
  id: string;
  user: User;
  content: string;
  time: string;
  type: 'text' | 'link-card';
  cardData?: {
    title: string;
    date: string;
    participants: string[];
    linkUrl?: string;
  };
};

const CURRENT_USER: User = { 
  id: 'u4', 
  name: 'You', 
  avatar: 'https://i.pravatar.cc/150?u=me', 
  role: 'participant', 
  status: 'online', 
  isCurrentUser: true 
};

// --- Mock Data ---
// (Kept so the chat messages still have user data to reference)
const CONTACTS: User[] = [
  { 
    id: 'u2', 
    name: 'Ansh P.', 
    avatar: 'https://i.pravatar.cc/150?u=ansh', 
    role: 'organizer', 
    status: 'online', 
    lastMessage: 'There going to be new event guys soon', 
    lastTime: '07:23 AM', 
    unread: 1 
  },
  { 
    id: 'u1', 
    name: 'Anant C.', 
    avatar: 'https://i.pravatar.cc/150?u=jonas', 
    role: 'participant', 
    status: 'online', 
    lastMessage: 'I am excited', 
    lastTime: '07:23 AM', 
    unread: 0 
  },
  { 
    id: 'u3', 
    name: 'Preeti Y.', 
    avatar: 'https://i.pravatar.cc/150?u=anna', 
    role: 'participant', 
    status: 'typing', 
    lastMessage: 'Can you send the link?', 
    lastTime: '07:34 AM', 
    unread: 0 
  },
  { 
    id: 'u5', 
    name: 'Sarah L.', 
    avatar: 'https://i.pravatar.cc/150?u=sarah', 
    role: 'participant', 
    status: 'offline', 
    lastMessage: 'See you all there.', 
    lastTime: 'Tue', 
    unread: 0 
  },
];

const MESSAGES: Message[] = [
  {
    id: 'm1',
    user: CONTACTS[1],
    content: 'Hi everyone! Really excited for this event. 🙏',
    time: '07:23 AM',
    type: 'text',
  },
  {
    id: 'm2',
    user: CONTACTS[0],
    content: "Welcome everyone! 🫶",
    time: '07:25 AM',
    type: 'text',
  },
  {
    id: 'm3',
    user: CONTACTS[2],
    content: 'Anna, could you send the link  🙏✨',
    time: '07:34 AM',
    type: 'text',
  },
  {
    id: 'm4',
    user: CONTACTS[0],
    content: '', 
    time: '',
    type: 'link-card',
    cardData: {
      title: 'New Events.........',
      date: 'Live Now • 11:00 AM',
      participants: ['https://i.pravatar.cc/150?u=p1', 'https://i.pravatar.cc/150?u=p2'],
      linkUrl: 'https://example.com/event'
    }
  },
  {
    id: 'm5',
    user: CURRENT_USER,
    content: "Joining now! Thanks Anna.",
    time: '07:35 AM',
    type: 'text',
  },
];

// --- Components ---

// 1. Chat Header
const ChatHeader = () => (
  <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
    <div className="flex items-center gap-4">
      {/* Menu button now serves as a mobile toggle or main menu since sidebar is gone */}
      <button className="p-2 -ml-2 hover:bg-neutral-800 rounded-full cursor-pointer transition text-neutral-400 hover:text-white" aria-label="Menu">
         <Menu size={20} />
      </button>

      <div>
         <h2 className="text-base font-bold text-white flex items-center gap-2">
           Culture
           <span className="bg-neutral-800 text-neutral-400 text-[10px] px-2 py-0.5 rounded-full border border-neutral-700">Live Session</span>
         </h2>
         <span className="text-xs text-neutral-500 flex items-center gap-1">
            <Users size={12} /> 167 Participants • 20 Organizers
         </span>
      </div>
    </div>
    
    <div className="flex items-center gap-3 text-neutral-400">
       <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md text-xs font-medium text-white transition">
         <ShieldCheck size={14} className="text-green-500" />
         Guidelines
       </button>
       <div className="w-px h-6 bg-neutral-800 mx-1"></div>
       <button className="hover:text-white cursor-pointer" aria-label="Start Voice Call"><Phone size={18} /></button>
       <button className="hover:text-white cursor-pointer" aria-label="Start Video Call"><Video size={18} /></button>
       <button className="hover:text-white cursor-pointer" aria-label="More Options"><MoreHorizontal size={18} /></button>
    </div>
  </header>
);

// 2. Link Card
const LinkCard = ({ data }: { data: NonNullable<Message['cardData']> }) => (
  // SECURITY: rel="noopener noreferrer" prevents reverse tabnabbing attacks on target="_blank"
  <a 
    href={data.linkUrl || '#'} 
    target="_blank"
    rel="noopener noreferrer" 
    className="block bg-neutral-800 p-4 rounded-2xl w-full max-w-sm ml-auto mt-2 border border-neutral-700 hover:border-amber-500/50 transition-all cursor-pointer group shadow-lg decoration-0"
  >
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
           <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Live Event</span>
        </div>
        <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
          {data.title}
        </span>
        <span className="text-xs text-neutral-400">{data.date}</span>
      </div>
      <div className="flex -space-x-2">
        {data.participants.map((src, i) => (
          <img key={i} src={src} alt="Participant avatar" className="w-8 h-8 rounded-full border-2 border-neutral-800 object-cover" />
        ))}
        <div className="w-8 h-8 rounded-full bg-neutral-700 border-2 border-neutral-800 flex items-center justify-center text-[10px] text-white font-medium">
          +20
        </div>
      </div>
    </div>
  </a>
);

// 3. Message Item
const MessageItem = ({ msg }: { msg: Message }) => {
  const isMe = msg.user.isCurrentUser;
  const isOrganizer = msg.user.role === 'organizer';

  if (msg.type === 'link-card' && msg.cardData) return <LinkCard data={msg.cardData} />;

  return (
    <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} group mb-4`}>
      <div className="relative mt-5">
        <img 
          src={msg.user.avatar} 
          alt={msg.user.name}
          className={`w-9 h-9 rounded-full object-cover border-2 shadow-md ${isOrganizer ? 'border-amber-500' : 'border-neutral-800'}`}
        />
        {isOrganizer && (
           <div className="absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-0.5">
             <Crown size={12} className="text-amber-500" fill="currentColor" aria-label="Host" />
           </div>
        )}
      </div>

      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className={`text-sm font-semibold ${isOrganizer ? 'text-amber-400' : 'text-neutral-300'}`}>
            {msg.user.name}
          </span>
          {isOrganizer && (
            <span className="bg-amber-500/10 text-amber-500 text-[9px] px-1.5 py-px rounded border border-amber-500/20 font-medium">
              HOST
            </span>
          )}
          <span className="text-[10px] text-neutral-500 pt-0.5">{msg.time}</span>
        </div>

        <div className={`
          px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm
          ${isMe 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : isOrganizer 
              ? 'bg-neutral-800 border border-amber-500/30 text-neutral-100 rounded-tl-none' 
              : 'bg-neutral-800 text-neutral-100 rounded-tl-none' 
          }
        `}>
          {msg.content}
        </div>
      </div>
    </div>
  );
};

// --- Main Layout ---
export default function EventChatInterface() {
  return (
    <div className="flex h-screen w-full bg-neutral-950 text-white font-sans overflow-hidden selection:bg-amber-500/30">
      
      {/* Sidebar REMOVED from here */}

      <main className="flex-1 flex flex-col relative min-w-0">
        <ChatHeader />

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 px-4 md:px-8 py-6">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex justify-center mb-8">
              <span className="bg-neutral-900 text-neutral-500 text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full border border-neutral-800">
                Event Started • Jan 26
              </span>
            </div>

            {MESSAGES.map((msg) => (
              <MessageItem key={msg.id} msg={msg} />
            ))}

            <div className="flex gap-4 items-end mt-4">
               <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center animate-pulse">
                  <MoreHorizontal size={18} className="text-neutral-600" />
               </div>
               <span className="text-xs text-neutral-500 mb-3">Jake T. is typing...</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-900">
          <div className="max-w-4xl mx-auto w-full">
            <form className="flex items-center gap-3" onSubmit={(e) => e.preventDefault()}>
               <div className="flex-1 bg-neutral-900 rounded-xl px-4 py-3 flex items-center gap-3 border border-neutral-800 focus-within:border-neutral-700 transition-colors">
                 <button type="button" className="text-neutral-400 hover:text-amber-500 transition" aria-label="Add attachment"><Plus size={20} /></button>
                 <input 
                   type="text" 
                   placeholder="Message the group..." 
                   className="bg-transparent border-none outline-none text-white placeholder-neutral-500 w-full text-sm"
                   aria-label="Message input"
                 />
                 <button type="button" className="text-neutral-400 hover:text-white transition" aria-label="Send image"><ImageIcon size={18} /></button>
               </div>
               <button type="submit" className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 text-white transition shadow-lg shadow-blue-900/20" aria-label="Send message">
                  <Send size={18} />
               </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}