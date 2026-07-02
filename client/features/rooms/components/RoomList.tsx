"use client";

import Link from 'next/link';
import toast from 'react-hot-toast';
import styles from '../styles/Rooms.module.css';

interface Room {
  id: string;
  title: string;
  inviteCode: string;
  role?: string;
}

export function RoomList({ rooms }: { rooms: Room[] }) {
  return (
    <div className={styles.roomGrid}>
      {rooms.map((room) => (
        <Link href={`/chat/${room.id}`} key={room.id} className={styles.roomCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 className={styles.roomTitle}>{room.title}</h3>
            {room.role && (
              <span className={room.role === 'owner' ? styles.badgeOwner : styles.badgeMember}>
                {room.role === 'owner' ? 'Admin' : 'User'}
              </span>
            )}
          </div>
          <span 
            className={styles.roomCode}
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(room.inviteCode);
              toast.success('Code copied: ' + room.inviteCode);
            }}
            title="Click to copy"
          >
            Code: {room.inviteCode}
          </span>
        </Link>
      ))}
      {rooms.length === 0 && <p style={{ color: '#a0a0b0' }}>You haven't joined any rooms yet.</p>}
    </div>
  );
}
