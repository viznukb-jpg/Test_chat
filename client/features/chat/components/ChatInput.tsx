"use client";

import { useState } from 'react';
import styles from '../styles/ChatWindow.module.css';

export function ChatInput({ onSend }: { onSend: (content: string) => void }) {
  const [content, setContent] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSend(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSend} className={styles.inputArea}>
      <input 
        className={styles.input} 
        placeholder="Type a message..." 
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button type="submit" className={styles.sendBtn}>Send</button>
    </form>
  );
}
