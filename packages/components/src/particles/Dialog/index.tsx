import { JSX, Show, mergeProps, createEffect, createMemo } from 'solid-js';
import { Transition } from 'solid-transition-group';
import Icon from '../Icon';
import createTransition from '../../utils/createTransition';
import clsx from 'clsx';

const transitionDuration = 100;

export interface DialogProps {
  open: boolean;
  size?: 'md' | 'lg';
  onClose?: () => void;
  children?: JSX.Element;
}

function Dialog(props: DialogProps) {
  const merged = mergeProps({ size: 'md', open: false }, props);

  const panelClasses = createMemo(() =>
    clsx(
      'relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:p-6',
      {
        'sm:max-w-lg': merged.size === 'lg',
        'sm:max-w-sm': merged.size === 'md'
      }
    )
  );

  createEffect(() => {
    if (window?.Intercom) {
      window.Intercom('update', {
        hide_default_launcher: merged.open
      });
    }
  });

  return (
    <div class="relative z-10">
      <Transition
        onEnter={createTransition([{ opacity: 0 }, { opacity: 1 }], {
          duration: transitionDuration,
          easing: 'ease-in'
        })}
        onExit={createTransition([{ opacity: 1 }, { opacity: 0 }], {
          duration: transitionDuration,
          easing: 'ease-out'
        })}
      >
        <Show when={merged.open}>
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Show>
      </Transition>
      <Transition
        onEnter={createTransition(
          [
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          {
            duration: transitionDuration,
            easing: 'ease-in'
          }
        )}
        onExit={createTransition(
          [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.95)' }
          ],
          {
            duration: transitionDuration,
            easing: 'ease-out'
          }
        )}
      >
        {merged.open && (
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class={panelClasses()}>
                <Show when={merged?.onClose}>
                  <div class="absolute right-0 top-0 pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={merged.onClose}
                    >
                      <span class="sr-only">Close</span>
                      <Icon name="xMark" class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </Show>
                {merged.children}
              </div>
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}

export default Dialog;
