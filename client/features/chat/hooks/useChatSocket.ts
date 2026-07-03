import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/shared/store/useAuthStore';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const useChatSocket = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const user = useAuthStore((state) => state.user);
  const [error, setError] = useState<string | null>(null);
  const [isKicked, setIsKicked] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(API_URL, {
      withCredentials: true,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      setError(null);
      socket.emit('joinRoom', { roomId });
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
    });

    socket.on('exception', (err) => {
      setError(err.message || 'Socket error');
      setTimeout(() => setError(null), 3000);
    });

    socket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('userKicked', (data: { targetUserId: string }) => {
      const currentUserId = useAuthStore.getState().user?.id;
      if (data.targetUserId === currentUserId) {
        setIsKicked(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, user]);

  const sendMessage = (content: string) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { roomId, content });
    }
  };

  return { messages, setMessages, sendMessage, error, isKicked };
};
