import toast from 'solid-toast';
import Icon from '../particles/Icon';
import { Show } from 'solid-js';
import Text from '../particles/Text';

type ToastProps = {
  header?: string;
  body?: string;
  status: 'success' | 'info' | 'error';
};

const triggerToast = (props: ToastProps) => {
  toast.custom(
    (t) => (
      <div
        class={`${t.visible ? 'animate-enter' : 'animate-leave'} flex gap-1 items-start border ${
          props.status === 'success'
            ? 'border-green-400'
            : props.status === 'error'
            ? 'border-red-400'
            : 'border-blue-400'
        } border-2 rounded-lg p-4 bg-white w-full sm:max-w-md sm:w-auto`}
      >
        <div
          class={
            props.status === 'success'
              ? 'text-green-500'
              : props.status === 'error'
              ? 'text-red-400'
              : 'text-blue-500'
          }
        >
          <Icon
            name={
              props.status === 'success'
                ? 'checkCircle'
                : props.status === 'error'
                ? 'exclamationCircle'
                : 'informationCircle'
            }
            class="mr-2"
          />
        </div>
        <div>
          <Show when={props?.header}>
            <Text bold>{props.header}</Text>
          </Show>
          <Show when={props.body}>
            <div>
              <Text>{props.body}</Text>
            </div>
          </Show>
        </div>
        <button
          type="button"
          class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => toast.dismiss(t.id)}
        >
          <span class="sr-only">Close</span>
          <Icon name="xMark" class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    ),
    {
      position: 'top-right',
      unmountDelay: 3000,
      ariaProps: {
        role: 'status',
        'aria-live': 'polite'
      }
    }
  );
};

export default triggerToast;
