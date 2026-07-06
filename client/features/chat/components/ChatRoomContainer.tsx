"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatSocket } from '../hooks/useChatSocket';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { apiClient } from '@/shared/api/axios';

interface Member {
  id: string;
  role: string;
  mutedUntil: string | null;
  user: { id: string; username: string };
}

interface Message {
  id: string;
  content: string;
  sender: { id: string; username: string } | null;
  createdAt: string;
}

interface ChatRoomContainerProps {
  roomId: string;
  initialMembers: Member[];
  initialMessages: Message[];
}

export function ChatRoomContainer({ roomId, initialMembers, initialMessages }: ChatRoomContainerProps) {
  const router = useRouter();
  const { messages, setMessages, sendMessage, error, isKicked } = useChatSocket(roomId);
  
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length === 50);

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);

  const loadMoreMessages = async () => {
    const currentMessages = messages.length > 0 ? messages : initialMessages;
    if (currentMessages.length === 0 || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const oldestMessage = currentMessages[0];
      const res = await apiClient.get(`/rooms/${roomId}/messages?cursorId=${oldestMessage.id}`);
      const olderMessages: Message[] = res.data;
      
      if (olderMessages.length < 50) {
        setHasMore(false);
      }
      
      setMessages((prev) => [...olderMessages, ...prev]);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-[#1e1e2f] to-[#252542] text-white font-sans">
        <ChatSidebar roomId={roomId} initialMembers={initialMembers} />
        
        <div className="flex-1 flex flex-col relative">
          <ChatMessages 
            messages={messages.length > 0 ? messages : initialMessages} 
            error={error} 
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
          <ChatInput onSend={sendMessage} />
        </div>
      </div>

      <ConfirmModal
        isOpen={isKicked}
        title="Removed from Room"
        message="You have been kicked from this room by the owner."
        confirmText="OK"
        onConfirm={() => router.push('/')}
        onCancel={() => router.push('/')}
      />
    </>
  );
}
