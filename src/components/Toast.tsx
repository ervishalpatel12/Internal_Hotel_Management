import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'integration';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div 
      id="toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-md w-full px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isIntegration = toast.type === 'integration';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              id={`toast-${toast.id}`}
              className={`pointer-events-auto rounded-xl p-4 shadow-2xl backdrop-blur-xl border flex items-start space-x-3 transition-colors ${
                isIntegration
                  ? 'bg-[#1A3A32]/95 border-[#D4AF37]/60 text-[#D4AF37] shadow-black/50'
                  : toast.type === 'success'
                  ? 'bg-[#1A3A32]/95 border-emerald-500/50 text-[#F7F4EB] shadow-black/50'
                  : toast.type === 'warning'
                  ? 'bg-[#1A3A32]/95 border-rose-500/50 text-rose-200 shadow-black/50'
                  : 'bg-[#1A3A32]/95 border-[#D4AF37]/40 text-[#F7F4EB] shadow-black/50'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                {isIntegration && <Zap className="w-5 h-5 text-[#D4AF37] animate-pulse" />}
                {!isIntegration && toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {!isIntegration && toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                {!isIntegration && toast.type === 'info' && <Info className="w-5 h-5 text-[#D4AF37]" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-wide text-[#F7F4EB]">
                    {toast.title}
                  </h4>
                </div>
                {toast.description && (
                  <p className="mt-1 text-xs text-[#F7F4EB]/80 leading-relaxed break-words">
                    {toast.description}
                  </p>
                )}
                {isIntegration && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#D4AF37]">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                    <span>Backend integration in progress</span>
                  </div>
                )}
              </div>

              <button
                id={`toast-close-${toast.id}`}
                onClick={() => onDismiss(toast.id)}
                className="text-[#F7F4EB]/60 hover:text-[#F7F4EB] p-1 rounded-lg hover:bg-[#0D231E]/60 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
