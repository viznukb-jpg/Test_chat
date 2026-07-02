"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';
import styles from '../styles/ChatWindow.module.css';

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
      {error && <div className={styles.errorToast}>{error}</div>}
      <div className={styles.messages}>
        {messages.map(msg => {
          const isOwn = msg.sender?.id === user?.id;
          return (
            <div key={msg.id} className={`${styles.message} ${isOwn ? styles.own : ''}`}>
              <div className={styles.sender}>{msg.sender?.username || 'Unknown'}</div>
              <div className={styles.text}>{msg.content}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
