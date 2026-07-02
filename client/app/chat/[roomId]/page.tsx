import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/shared/api/server-fetch';
import { ChatRoomContainer } from '@/features/chat/components/ChatRoomContainer';

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    redirect('/');
  }

  let initialMembers = [];
  let initialMessages = [];

  try {
    [initialMembers, initialMessages] = await Promise.all([
      serverFetch(`/rooms/${roomId}/members`),
      serverFetch(`/rooms/${roomId}/messages`),
    ]);
  } catch (err) {
    console.error('Failed to load chat data:', err);
    // If room doesn't exist or user not in room
    redirect('/');
  }

  return (
    <ChatRoomContainer 
      roomId={roomId} 
      initialMembers={initialMembers} 
      initialMessages={initialMessages} 
    />
  );
}
