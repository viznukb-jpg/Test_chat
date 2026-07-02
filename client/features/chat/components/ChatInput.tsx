"use client";

import { useState } from 'react';

export function ChatInput({ onSend }: { onSend: (content: string) => void }) {
  const [content, setContent] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSend(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSend} className="py-5 px-[30px] bg-black/20 border-t border-white/5 flex gap-3">
      <input 
        className="flex-1 bg-white/5 border border-white/10 rounded-full py-3.5 px-5 text-white outline-none font-inherit focus:border-indigo-500 transition-colors" 
        placeholder="Type a message..." 
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button type="submit" className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none rounded-full px-6 font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0">Send</button>
    </form>
  );
}
