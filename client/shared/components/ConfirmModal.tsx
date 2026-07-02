"use client";

import { useEffect, useState } from 'react';
import styles from '../styles/ConfirmModal.module.css';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: (durationMins?: number) => void;
  onCancel: () => void;
  requireDuration?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
  requireDuration = false,
}: ConfirmModalProps) {
  const [duration, setDuration] = useState<number>(15); // Default to 15 mins

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>

        {requireDuration && (
          <div className={styles.selectWrapper}>
            <label className={styles.selectLabel}>Mute Duration</label>
            <select
              className={styles.select}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        )}

        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`${styles.btn} ${isDanger ? styles.dangerBtn : styles.confirmBtn}`}
            onClick={() => onConfirm(requireDuration ? duration : undefined)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
