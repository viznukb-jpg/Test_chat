"use client";

import { useEffect, useState } from 'react';

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
  const [duration, setDuration] = useState<number>(15);

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
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in" 
      onClick={onCancel}
    >
      <div 
        className="bg-white/5 border border-white/10 rounded-2xl p-8 w-[90%] max-w-[400px] shadow-[0_16px_40px_rgba(0,0,0,0.3)] text-center animate-slide-up" 
        onClick={e => e.stopPropagation()}
      >
        <h2 className="m-0 mb-3 text-2xl text-white">{title}</h2>
        <p className="m-0 mb-6 text-white/70 text-base leading-relaxed">{message}</p>

        {requireDuration && (
          <div className="mb-6 text-left">
            <label className="block mb-2 text-white/90 text-sm">Mute Duration</label>
            <select
              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white text-base outline-none cursor-pointer focus:border-indigo-500 appearance-none"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option className="bg-[#1e1e2d] text-white" value={5}>5 minutes</option>
              <option className="bg-[#1e1e2d] text-white" value={10}>10 minutes</option>
              <option className="bg-[#1e1e2d] text-white" value={15}>15 minutes</option>
              <option className="bg-[#1e1e2d] text-white" value={30}>30 minutes</option>
              <option className="bg-[#1e1e2d] text-white" value={45}>45 minutes</option>
              <option className="bg-[#1e1e2d] text-white" value={60}>60 minutes</option>
            </select>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button 
            className="flex-1 py-3 px-6 rounded-lg border-none text-base font-semibold cursor-pointer transition-all duration-200 bg-white/10 text-white hover:bg-white/15" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`flex-1 py-3 px-6 rounded-lg border-none text-base font-semibold cursor-pointer transition-all duration-200 text-white hover:-translate-y-0.5 ${
              isDanger 
                ? 'bg-red-500 hover:bg-red-600 hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]' 
                : 'bg-indigo-500 hover:bg-indigo-600 hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
            }`}
            onClick={() => onConfirm(requireDuration ? duration : undefined)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
