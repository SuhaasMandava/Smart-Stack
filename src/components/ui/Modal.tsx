/**
 * Modal — a lightweight accessible dialog used for the task form and the
 * "log actual time" prompt. Handles the backdrop, Escape-to-close, and body
 * scroll locking so the individual dialogs stay focused on their content.
 */
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop — clicking it closes the modal. */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
