"use client";

import { useEffect } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import styles from '../styles/ChatWindow.module.css';

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
  const { messages, setMessages, sendMessage, error } = useChatSocket(roomId);

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);

  return (
    <div className={styles.container}>
      <ChatSidebar roomId={roomId} initialMembers={initialMembers} />
      
      <div className={styles.chatArea}>
        <ChatMessages messages={messages.length > 0 ? messages : initialMessages} error={error} />
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}
