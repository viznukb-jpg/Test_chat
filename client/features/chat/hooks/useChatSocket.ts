import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/shared/store/useAuthStore';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string };
}

export const useChatSocket = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.accessToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:4000', {
      auth: { token },
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

    return () => {
      socket.disconnect();
    };
  }, [roomId, token]);

  const sendMessage = (content: string) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { roomId, content });
    }
  };

  return { messages, setMessages, sendMessage, error };
};
