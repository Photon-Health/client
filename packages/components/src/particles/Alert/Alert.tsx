import { createMemo } from 'solid-js';
import Icon from '../Icon';

type AlertType = 'success' | 'info' | 'warning' | 'error';
type AlertProps = {
  type: AlertType;
  header: string;
  message: string;
};

export const Alert = (props: AlertProps) => {
  const iconName = createMemo(() => {
    switch (props.type) {
      case 'success':
        return 'checkCircle';
      case 'info':
        return 'informationCircle';
      case 'warning':
        return 'exclamationTriangle';
      case 'error':
        return 'xCircle';
    }
  });

  const textColor = createMemo(() => {
    switch (props.type) {
      case 'success':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
    }
  });

  const bgColor = createMemo(() => {
    switch (props.type) {
      case 'success':
        return 'bg-green-50';
      case 'info':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
    }
  });

  // add a border color using tailwind for all the cases
  const borderColor = createMemo(() => {
    switch (props.type) {
      case 'success':
        return 'border-green-200';
      case 'info':
        return 'border-blue-200';
      case 'warning':
        return 'border-yellow-200';
      case 'error':
        return 'border-red-200';
    }
  });

  return (
    <div class={`rounded-md ${bgColor()} border-2 ${borderColor()} p-4`}>
      <div class="flex">
        <div class="flex-shrink-0">
          <Icon name={iconName()} class={textColor()} />
        </div>
        <div class="ml-3">
          <h3 class={`text-base font-medium mt-0 ${textColor()}`}>{props.header}</h3>
          <div class={`mt-2 ${textColor()}`}>
            <p class="text-sm mb-0">{props.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
