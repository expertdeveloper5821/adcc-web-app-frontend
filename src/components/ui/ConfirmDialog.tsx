import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  confirmBgColor?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  icon: Icon,
  iconBgColor = '#FEE2E2',
  iconColor = '#EF4444',
  confirmBgColor = '#EF4444',
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl mx-4">
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="p-2 rounded-lg" style={{ backgroundColor: iconBgColor }}>
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
          )}
          <h3 className="text-lg font-semibold" style={{ color: '#333' }}>
            {title}
          </h3>
        </div>
        <p className="text-sm mb-6" style={{ color: '#666' }}>
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm transition-all hover:bg-gray-50"
            style={{ color: '#666' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: confirmBgColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
