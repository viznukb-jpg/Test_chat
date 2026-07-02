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
          
          // Format date as "Month Day Hour:Minute" (e.g. 02.07 15:30)
          const date = new Date(msg.createdAt);
          const formattedDate = date.toLocaleString('uk-UA', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={msg.id} className={`${styles.message} ${isOwn ? styles.own : ''}`}>
              <div className={styles.sender}>{msg.sender?.username || 'Unknown'}</div>
              <div className={styles.text}>{msg.content}</div>
              <div className={styles.timestamp}>{formattedDate}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
