import type { ReactNode, FC } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface UIContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeModal: string | null;
  setActiveModal: (modalName: string | null) => void;
  closeModal: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpenState] = useState<boolean>(true);
  const [activeModal, setActiveModalState] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpenState((prev) => !prev);
  }, []);

  const setActiveModal = useCallback((modalName: string | null) => {
    setActiveModalState(modalName);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModalState(null);
  }, []);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        activeModal,
        setActiveModal,
        closeModal,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

// eslint-disable-next-line react/only-export-components
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
