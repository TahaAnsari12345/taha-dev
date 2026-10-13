import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon';

const ToastContext = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    ({ type = 'success', message }) => {
      nextId.current += 1;
      const id = nextId.current;
      setItems((list) => [...list.slice(-2), { id, type, message }]);
      setTimeout(() => dismiss(id), 5200);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4 text-sm"
            >
              <Icon
                name={t.type === 'success' ? 'success' : 'alert'}
                className={`mt-0.5 h-5 w-5 shrink-0 ${t.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}
              />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-muted transition hover:text-fg"
                aria-label="Dismiss notification"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
