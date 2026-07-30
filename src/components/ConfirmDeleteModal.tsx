import React from 'react';
import { ModalPortal } from './ModalPortal.tsx';
import { Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  title = "Confirmar Exclusão",
  description,
  itemName,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
  isLoading = false
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div 
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative"
          id="confirm_delete_modal"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            id="btn_close_confirm_modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header & Icon */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/80 dark:border-rose-900/50">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-display">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {description ? description : (
                  <>
                    Tem certeza de que deseja eliminar {itemName ? <strong className="text-slate-800 dark:text-slate-200">"{itemName}"</strong> : 'este item'}? Esta ação não pode ser desfeita.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              id="btn_cancel_delete"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center space-x-1.5"
              id="btn_confirm_delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isLoading ? 'A eliminar...' : confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default ConfirmDeleteModal;
