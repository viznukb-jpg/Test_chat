"use client";

import { useState } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';

export function UserActions({ btnClassName }: { btnClassName?: string }) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [modalType, setModalType] = useState<'logout' | 'delete' | null>(null);

  const handleAction = async () => {
    if (modalType === 'logout') {
      logout();
      router.push('/');
      router.refresh();
    } else if (modalType === 'delete') {
      try {
        await authApi.deleteAccount();
        logout();
        router.push('/');
        router.refresh();
        toast.success('Account deleted successfully');
      } catch (err) {
        console.error('Failed to delete account', err);
        toast.error('Failed to delete account');
      }
    }
    setModalType(null);
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button className={btnClassName} onClick={() => setModalType('logout')}>
        Log Out
      </button>
      <button 
        className={btnClassName} 
        style={{ color: '#ff4d4f', borderColor: 'rgba(255, 77, 79, 0.2)', background: 'rgba(255, 77, 79, 0.1)' }}
        onClick={() => setModalType('delete')}
      >
        Delete Account
      </button>

      <ConfirmModal
        isOpen={!!modalType}
        title={modalType === 'logout' ? 'Log Out' : 'Delete Account'}
        message={
          modalType === 'logout' 
            ? 'Are you sure you want to log out?' 
            : 'Are you sure you want to completely delete your account? This action cannot be undone and will delete all your rooms.'
        }
        confirmText={modalType === 'logout' ? 'Log Out' : 'Delete Account'}
        isDanger={true}
        onConfirm={handleAction}
        onCancel={() => setModalType(null)}
      />
    </div>
  );
}
