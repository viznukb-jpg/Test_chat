"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { roomsApi } from '@/features/rooms/api/rooms.api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import styles from '@/features/rooms/styles/Rooms.module.css';

interface Room {
  id: string;
  title: string;
  inviteCode: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, accessToken, logout } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    loadRooms();
  }, [accessToken, router]);

  const loadRooms = async () => {
    try {
      const data = await roomsApi.getMyRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    try {
      await roomsApi.createRoom(newRoomTitle);
      setNewRoomTitle('');
      loadRooms();
    } catch (err) {
      alert('Failed to create room');
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      await roomsApi.joinRoom(joinCode);
      setJoinCode('');
      loadRooms();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to join room');
      }
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hello, {user.username}</h1>
        <button className={styles.logoutBtn} onClick={() => { logout(); router.push('/login'); }}>
          Log Out
        </button>
      </header>

      <div className={styles.actionRow}>
        <form onSubmit={handleCreateRoom} className={styles.inputGroup}>
          <input 
            className={styles.input} 
            placeholder="New room name..." 
            value={newRoomTitle} 
            onChange={(e) => setNewRoomTitle(e.target.value)} 
          />
          <button className={styles.btn} type="submit">Create Room</button>
        </form>

        <form onSubmit={handleJoinRoom} className={styles.inputGroup}>
          <input 
            className={styles.input} 
            placeholder="Invite code (e.g. A1B2C3D4)" 
            value={joinCode} 
            onChange={(e) => setJoinCode(e.target.value)} 
          />
          <button className={styles.btn} type="submit">Join</button>
        </form>
      </div>

      <h2 className={styles.sectionTitle}>Your Chats</h2>
      
      <div className={styles.roomGrid}>
        {rooms.map((room) => (
          <Link href={`/chat/${room.id}`} key={room.id} className={styles.roomCard}>
            <h3 className={styles.roomTitle}>{room.title}</h3>
            <span className={styles.roomCode}>Code: {room.inviteCode}</span>
          </Link>
        ))}
        {rooms.length === 0 && <p style={{ color: '#a0a0b0' }}>You haven't joined any rooms yet.</p>}
      </div>
    </div>
  );
}
