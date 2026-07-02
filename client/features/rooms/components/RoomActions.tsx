"use client";

import { useState } from 'react';
import { roomsApi } from '../api/rooms.api';
import toast from 'react-hot-toast';
import axios from 'axios';
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
      router.refresh();
    } catch (err) {
      console.error('Failed to create room', err);
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      await roomsApi.joinRoom(joinCode);
      setJoinCode('');
      router.refresh();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to join room');
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 bg-white/5 p-6 rounded-3xl border border-white/5">
      <form onSubmit={handleCreateRoom} className="flex gap-3 flex-1">
        <input 
          className="bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white flex-1 outline-none transition-colors duration-200 focus:border-indigo-500" 
          placeholder="New room name..." 
          value={newRoomTitle} 
          onChange={(e) => setNewRoomTitle(e.target.value)} 
        />
        <button className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none rounded-xl py-3 px-6 font-semibold cursor-pointer transition-transform duration-200 whitespace-nowrap hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" type="submit">Create Room</button>
      </form>

      <form onSubmit={handleJoinRoom} className="flex gap-3 flex-1">
        <input 
          className="bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white flex-1 outline-none transition-colors duration-200 focus:border-indigo-500" 
          placeholder="Invite code (e.g. A1B2C3D4)" 
          value={joinCode} 
          onChange={(e) => setJoinCode(e.target.value)} 
        />
        <button className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none rounded-xl py-3 px-6 font-semibold cursor-pointer transition-transform duration-200 whitespace-nowrap hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" type="submit">Join</button>
      </form>
    </div>
  );
}
