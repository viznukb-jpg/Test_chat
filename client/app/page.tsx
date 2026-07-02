import { cookies } from 'next/headers';
import { serverFetch } from '@/shared/api/server-fetch';
import { LandingHero } from '@/features/landing/components/LandingHero';
import { RoomList } from '@/features/rooms/components/RoomList';
import { RoomActions } from '@/features/rooms/components/RoomActions';
import { UserActions } from '@/features/auth/components/UserActions';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return <LandingHero />;
  }

  let user = null;
  let rooms = [];

  try {
    
    [user, rooms] = await Promise.all([
      serverFetch('/auth/me'),
      serverFetch('/rooms'),
    ]);

    
    rooms.sort((a: { role?: string }, b: { role?: string }) => {
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (a.role !== 'owner' && b.role === 'owner') return 1;
      return 0;
    });
  } catch {
    return <LandingHero />;
  }

  return (
    <div className="p-10 max-w-[900px] mx-auto text-white font-sans min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold m-0 bg-gradient-to-br from-purple-400 to-indigo-500 text-transparent bg-clip-text">
          Hello, {user?.username}
        </h1>
        <UserActions btnClassName="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl py-2 px-4 cursor-pointer transition-colors duration-200 font-medium hover:bg-red-500/20" />
      </header>

      <RoomActions />

      <h2 className="text-xl font-semibold mb-5 text-[#d1d1e0]">Your Chats</h2>
      
      <RoomList rooms={rooms} />
    </div>
  );
}
