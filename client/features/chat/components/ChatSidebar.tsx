"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { roomsApi } from '@/features/rooms/api/rooms.api';
import { ConfirmModal } from '@/shared/components/ConfirmModal';

interface Member {
  id: string;
  role: string;
  mutedUntil: string | null;
  user: { id: string; username: string };
}

interface ChatSidebarProps {
  roomId: string;
  initialMembers: Member[];
}

type ModalState = 
  | { type: 'kick'; targetId: string }
  | { type: 'mute'; targetId: string }
  | { type: 'unmute'; targetId: string }
  | { type: 'delete' }
  | { type: 'leave' }
  | null;

export function ChatSidebar({ roomId, initialMembers }: ChatSidebarProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [modalState, setModalState] = useState<ModalState>(null);

  const loadMembers = async () => {
    try {
      const data = await roomsApi.getMembers(roomId);
      setMembers(data);
    } catch (err) {
      console.error('Failed to refresh members', err);
    }
  };

  const handleAction = async (durationMins?: number) => {
    if (!modalState) return;

    try {
      if (modalState.type === 'delete') {
        await roomsApi.deleteRoom(roomId);
        router.push('/');
        return;
      }

      if (modalState.type === 'leave') {
        await roomsApi.leaveRoom(roomId);
        router.push('/');
        return;
      }

      if (modalState.type === 'kick') {
        await roomsApi.kickUser(roomId, modalState.targetId);
      } else if (modalState.type === 'mute') {
        await roomsApi.muteUser(roomId, modalState.targetId, durationMins || 15);
      } else if (modalState.type === 'unmute') {
        await roomsApi.unmuteUser(roomId, modalState.targetId);
      }

      await loadMembers();
      setModalState(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || `Failed to ${modalState.type}`);
      }
      setModalState(null);
    }
  };

  const myMember = members.find(m => m.user.id === user?.id);
  const isOwner = myMember?.role === 'owner';

  return (
    <>
      <div className="w-[280px] bg-black/20 border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="text-purple-400 no-underline text-sm font-medium inline-block mb-3 hover:underline">← Back to Rooms</Link>
          <h2>Room Members</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {members.map(m => {
            const isMuted = m.mutedUntil && new Date(m.mutedUntil) > new Date();
            return (
              <div key={m.id} className="flex justify-between items-center mb-3 bg-white/5 p-2.5 rounded-xl">
                <div>
                  <div className="text-sm font-medium">{m.user.username} {m.user.id === user?.id && '(You)'}</div>
                  <div className="text-[10px] text-purple-400 uppercase tracking-widest">{m.role}</div>
                  {isMuted && (
                    <div className="text-red-500 text-[10px]">Muted</div>
                  )}
                </div>
                {isOwner && m.user.id !== user?.id && (
                  <div className="flex gap-1.5 mt-1.5">
                    {isMuted ? (
                      <button 
                        className="bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 text-[11px] py-1 px-2 rounded cursor-pointer"
                        onClick={() => setModalState({ type: 'unmute', targetId: m.user.id })}
                      >
                        Unmute
                      </button>
                    ) : (
                      <button 
                        className="bg-white/10 border-none text-white text-[11px] py-1 px-2 rounded cursor-pointer"
                        onClick={() => setModalState({ type: 'mute', targetId: m.user.id })}
                      >
                        Mute
                      </button>
                    )}
                    <button 
                      className="bg-red-500/20 border-none text-red-500 text-[11px] py-1 px-2 rounded cursor-pointer"
                      onClick={() => setModalState({ type: 'kick', targetId: m.user.id })}
                    >
                      Kick
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {isOwner ? (
          <div className="p-5 border-t border-white/5">
            <button 
              onClick={() => setModalState({ type: 'delete' })}
              className="w-full p-2.5 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg cursor-pointer font-semibold"
            >
              Delete Room
            </button>
          </div>
        ) : (
          <div className="p-5 border-t border-white/5">
            <button 
              onClick={() => setModalState({ type: 'leave' })}
              className="w-full p-2.5 bg-white/10 text-white border border-white/20 rounded-lg cursor-pointer font-semibold"
            >
              Leave Room
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!modalState}
        title={
          modalState?.type === 'kick' ? 'Kick User' :
          modalState?.type === 'mute' ? 'Mute User' :
          modalState?.type === 'unmute' ? 'Unmute User' :
          modalState?.type === 'leave' ? 'Leave Room' :
          'Delete Room'
        }
        message={
          modalState?.type === 'kick' ? 'Are you sure you want to kick this user from the room?' :
          modalState?.type === 'mute' ? 'Select mute duration for this user:' :
          modalState?.type === 'unmute' ? 'Are you sure you want to unmute this user?' :
          modalState?.type === 'leave' ? 'Are you sure you want to leave this room?' :
          'Are you sure you want to delete this room? This action cannot be undone.'
        }
        isDanger={modalState?.type === 'kick' || modalState?.type === 'delete' || modalState?.type === 'leave'}
        confirmText={
          modalState?.type === 'kick' ? 'Kick' :
          modalState?.type === 'mute' ? 'Mute' :
          modalState?.type === 'unmute' ? 'Unmute' :
          modalState?.type === 'leave' ? 'Leave' :
          'Delete'
        }
        requireDuration={modalState?.type === 'mute'}
        onConfirm={handleAction}
        onCancel={() => setModalState(null)}
      />
    </>
  );
}
