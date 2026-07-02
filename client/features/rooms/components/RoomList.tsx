"use client";

import Link from 'next/link';
import toast from 'react-hot-toast';

interface Room {
  id: string;
  title: string;
  inviteCode: string;
  role?: string;
}

export function RoomList({ rooms }: { rooms: Room[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
      {rooms.map((room) => (
        <Link href={`/chat/${room.id}`} key={room.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-200 cursor-pointer text-inherit flex flex-col h-full no-underline hover:-translate-y-1 hover:bg-white/[0.08] hover:border-indigo-500/50 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.2)]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold m-0 text-white">{room.title}</h3>
            {room.role && (
              <span className={`text-[10px] py-1 px-2 rounded-md uppercase font-bold tracking-wider ${room.role === 'owner' ? 'bg-indigo-500/20 text-purple-400 border border-indigo-500/30' : 'bg-white/5 text-[#a0a0b0]'}`}>
                {room.role === 'owner' ? 'Admin' : 'User'}
              </span>
            )}
          </div>
          <span 
            className="text-xs text-[#a0a0b0] bg-black/30 py-1.5 px-2.5 rounded-lg self-start font-mono tracking-widest hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(room.inviteCode);
              toast.success('Code copied: ' + room.inviteCode);
            }}
            title="Click to copy"
          >
            Code: {room.inviteCode}
          </span>
        </Link>
      ))}
      {rooms.length === 0 && <p className="text-[#a0a0b0]">You haven&apos;t joined any rooms yet.</p>}
    </div>
  );
}
