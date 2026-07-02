"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';

interface Message {
  id: string;
  content: string;
  sender: { id: string; username: string } | null;
  createdAt: string;
}

export function ChatMessages({ messages, error }: { messages: Message[], error: string | null }) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {error && <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white py-2.5 px-5 rounded-full text-sm font-medium shadow-[0_10px_20px_rgba(255,77,79,0.3)] z-10">{error}</div>}
      <div className="flex-1 overflow-y-auto p-[30px] flex flex-col gap-4">
        {messages.map(msg => {
          const isOwn = msg.sender?.id === user?.id;
          
          const date = new Date(msg.createdAt);
          const formattedDate = date.toLocaleString('uk-UA', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={msg.id} className={`max-w-[65%] p-3 px-4 rounded-2xl ${isOwn ? 'bg-gradient-to-br from-indigo-500 to-purple-500 rounded-bl-2xl rounded-br-md self-end' : 'bg-white/5 rounded-bl-md self-start'}`}>
              <div className={`text-[11px] font-semibold mb-1 ${isOwn ? 'text-white/70' : 'text-[#a0a0b0]'}`}>{msg.sender?.username || 'Unknown'}</div>
              <div className="text-sm leading-relaxed">{msg.content}</div>
              <div className={`text-[10px] mt-1.5 text-right ${isOwn ? 'text-white/60' : 'text-white/50'}`}>{formattedDate}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
