import { cookies } from 'next/headers';
import { serverFetch } from '@/shared/api/server-fetch';
import { LandingHero } from '@/features/landing/components/LandingHero';
import { RoomList } from '@/features/rooms/components/RoomList';
import { RoomActions } from '@/features/rooms/components/RoomActions';
import { UserActions } from '@/features/auth/components/UserActions';
import styles from '@/features/rooms/styles/Rooms.module.css';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return <LandingHero />;
  }

  let user = null;
  let rooms = [];

  try {
    // Fetch user and rooms simultaneously using the serverFetch utility
    [user, rooms] = await Promise.all([
      serverFetch('/auth/me'),
      serverFetch('/rooms'),
    ]);

    // Sort rooms: owner first, then member
    rooms.sort((a: any, b: any) => {
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (a.role !== 'owner' && b.role === 'owner') return 1;
      return 0;
    });
  } catch (err) {
    console.error('Failed to fetch data on server:', err);
    // If token is invalid or expired, render Landing. The client-side axios interceptor
    // will eventually clean up the zustand store, but the cookie needs clearing too.
    return <LandingHero />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hello, {user?.username}</h1>
        <UserActions btnClassName={styles.logoutBtn} />
      </header>

      <RoomActions />

      <h2 className={styles.sectionTitle}>Your Chats</h2>
      
      <RoomList rooms={rooms} />
    </div>
  );
}
