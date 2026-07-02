"use client";

import { useState } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/shared/components/ConfirmModal';

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh(); // Force SSR refresh after logging out
  };

  return (
    <>
      <button className={className} onClick={() => setShowModal(true)}>
        Log Out
      </button>
      <ConfirmModal
        isOpen={showModal}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        isDanger={true}
        onConfirm={handleLogout}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
