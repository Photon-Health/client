import { createContext, JSXElement, useContext } from 'solid-js';
import { ToastProps } from '../../utils/toastTriggers';
import { triggerToast } from '../../index';

interface ToastContextType {
  tryTriggerToast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType>();

interface ToastProviderProps {
  children: JSXElement;
  disableToastStatuses: Array<ToastProps['status']>;
}

export const ToastProvider = (props: ToastProviderProps) => {
  const tryTriggerToast = (options: ToastProps) => {
    if (props.disableToastStatuses.includes(options.status)) {
      return;
    }
    triggerToast(options);
  };

  const value: ToastContextType = {
    tryTriggerToast
  };

  return <ToastContext.Provider value={value}>{props.children}</ToastContext.Provider>;
};
export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within the ToastProvider');
  }
  return context;
};
