import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, ...toast }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, toast.duration || 4200);
  }, []);

  const value = useMemo(
    () => ({
      success: (message) => push({ type: 'success', message }),
      error: (message) => push({ type: 'error', message }),
      toasts,
    }),
    [push, toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[80] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm backdrop-blur-xl shadow-panel ${
              toast.type === 'error'
                ? 'border-danger/40 bg-surface/95 text-danger'
                : 'border-accent/40 bg-surface/95 text-success'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
