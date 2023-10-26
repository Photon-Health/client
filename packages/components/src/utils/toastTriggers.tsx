import toast from 'solid-toast';
import Icon from '../particles/Icon';
import type { ToastOptions } from 'solid-toast';

const defaultToastOptions: ToastOptions = {
  position: 'top-right',
  unmountDelay: 500,
  ariaProps: {
    role: 'status',
    'aria-live': 'polite'
  }
};

const successToast = (text: string) => {
  toast.success(text, {
    ...defaultToastOptions,
    duration: 3000,
    style: {
      top: '100px',
      'border-radius': '0.5rem', // tailwind rounded-lg
      border: '2px solid rgb(34, 197, 94)' // tailwind green 500
    },
    iconTheme: {
      primary: '#fff',
      secondary: 'rgb(34 197 94)' // tailwind green 500
    }
  });
};

const infoToast = (text: string) => {
  toast.success(text, {
    ...defaultToastOptions,
    duration: 5000,
    style: {
      'border-radius': '0.5rem', // tailwind rounded-lg
      border: '2px solid rgb(59 130 246)' // tailwind blue 500
    },
    icon: <Icon name="informationCircle" class="text-blue-500" />
  });
};

export { successToast, infoToast };
