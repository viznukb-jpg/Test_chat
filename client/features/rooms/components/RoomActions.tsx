"use client";

import { useState } from 'react';
import { roomsApi } from '../api/rooms.api';
import toast from 'react-hot-toast';
import axios from 'axios';
import styles from '../styles/Rooms.module.css';
import { useRouter } from 'next/navigation';

export function RoomActions() {
  const router = useRouter();
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;
    try {
      await roomsApi.createRoom(newRoomTitle);
      setNewRoomTitle('');
      router.refresh(); // Refresh SSR data
    } catch (err) {
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      await roomsApi.joinRoom(joinCode);
      setJoinCode('');
      router.refresh(); // Refresh SSR data
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to join room');
      }
    }
  };

  return (
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
  );
}
