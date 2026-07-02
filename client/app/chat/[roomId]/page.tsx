"use client";

import { useEffect, useState, useRef, use } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { roomsApi } from '@/features/rooms/api/rooms.api';
import { chatApi } from '@/features/chat/api/chat.api';
import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '@/features/chat/styles/ChatWindow.module.css';

interface Member {
  id: string;
  role: string;
  mutedUntil: string | null;
  user: { id: string; username: string };
}

export default function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const { user } = useAuthStore();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const { messages, setMessages, sendMessage, error } = useChatSocket(roomId);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [roomId, user, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [membersData, historyData] = await Promise.all([
        roomsApi.getMembers(roomId),
        chatApi.getHistory(roomId),
      ]);
      setMembers(membersData);
      setMessages(historyData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMessage(content);
    setContent('');
  };

  const handleKick = async (targetId: string) => {
    try {
      await roomsApi.kickUser(roomId, targetId);
      loadData();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to kick');
      }
    }
  };

  const handleMute = async (targetId: string) => {
    try {
      await roomsApi.muteUser(roomId, targetId, 5);
      loadData();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to mute');
      }
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    try {
      await roomsApi.deleteRoom(roomId);
      router.push('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const myMember = members.find(m => m.user.id === user?.id);
  const isOwner = myMember?.role === 'owner';

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.backBtn}>← Back to Rooms</Link>
          <h2>Room Members</h2>
        </div>
        <div className={styles.memberList}>
          {members.map(m => (
            <div key={m.id} className={styles.memberItem}>
              <div>
                <div className={styles.memberName}>{m.user.username} {m.user.id === user?.id && '(You)'}</div>
                <div className={styles.memberRole}>{m.role}</div>
                {m.mutedUntil && new Date(m.mutedUntil) > new Date() && (
                  <div style={{ color: '#ff4d4f', fontSize: '10px' }}>Muted</div>
                )}
              </div>
              {isOwner && m.user.id !== user?.id && (
                <div className={styles.actionBtns}>
                  <button className={styles.muteBtn} onClick={() => handleMute(m.user.id)}>Mute</button>
                  <button className={styles.kickBtn} onClick={() => handleKick(m.user.id)}>Kick</button>
                </div>
              )}
            </div>
          ))}
        </div>
        {isOwner && (
          <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button 
              onClick={handleDeleteRoom}
              style={{ width: '100%', padding: '10px', background: 'rgba(255, 77, 79, 0.2)', color: '#ff4d4f', border: '1px solid rgba(255, 77, 79, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Delete Room
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
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

        <form onSubmit={handleSend} className={styles.inputArea}>
          <input 
            className={styles.input} 
            placeholder="Type a message..." 
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button type="submit" className={styles.sendBtn}>Send</button>
        </form>
      </div>
    </div>
  );
}
