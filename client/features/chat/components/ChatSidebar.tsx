"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { roomsApi } from '@/features/rooms/api/rooms.api';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import styles from '../styles/ChatWindow.module.css';

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
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.backBtn}>← Back to Rooms</Link>
          <h2>Room Members</h2>
        </div>
        <div className={styles.memberList}>
          {members.map(m => {
            const isMuted = m.mutedUntil && new Date(m.mutedUntil) > new Date();
            return (
              <div key={m.id} className={styles.memberItem}>
                <div>
                  <div className={styles.memberName}>{m.user.username} {m.user.id === user?.id && '(You)'}</div>
                  <div className={styles.memberRole}>{m.role}</div>
                  {isMuted && (
                    <div style={{ color: '#ff4d4f', fontSize: '10px' }}>Muted</div>
                  )}
                </div>
                {isOwner && m.user.id !== user?.id && (
                  <div className={styles.actionBtns}>
                    {isMuted ? (
                      <button 
                        className={styles.muteBtn} 
                        style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                        onClick={() => setModalState({ type: 'unmute', targetId: m.user.id })}
                      >
                        Unmute
                      </button>
                    ) : (
                      <button 
                        className={styles.muteBtn} 
                        onClick={() => setModalState({ type: 'mute', targetId: m.user.id })}
                      >
                        Mute
                      </button>
                    )}
                    <button 
                      className={styles.kickBtn} 
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
        {isOwner && (
          <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button 
              onClick={() => setModalState({ type: 'delete' })}
              style={{ width: '100%', padding: '10px', background: 'rgba(255, 77, 79, 0.2)', color: '#ff4d4f', border: '1px solid rgba(255, 77, 79, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Delete Room
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
          'Delete Room'
        }
        message={
          modalState?.type === 'kick' ? 'Are you sure you want to kick this user from the room?' :
          modalState?.type === 'mute' ? 'Select mute duration for this user:' :
          modalState?.type === 'unmute' ? 'Are you sure you want to unmute this user?' :
          'Are you sure you want to delete this room? This action cannot be undone.'
        }
        isDanger={modalState?.type === 'kick' || modalState?.type === 'delete'}
        confirmText={
          modalState?.type === 'kick' ? 'Kick' :
          modalState?.type === 'mute' ? 'Mute' :
          modalState?.type === 'unmute' ? 'Unmute' :
          'Delete'
        }
        requireDuration={modalState?.type === 'mute'}
        onConfirm={handleAction}
        onCancel={() => setModalState(null)}
      />
    </>
  );
}
