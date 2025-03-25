import { Portal } from 'solid-js/web';
import { Component, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import Icon, { IconName } from '../Icon';
import createTransition from '../../utils/createTransition';
import { Transition } from 'solid-transition-group';

export type FlyoutOption = {
  label: string;
  icon?: IconName;
  link?: string;
  onClick?: () => void;
};

interface FlyoutProps {
  options: FlyoutOption[];
}

export const FlyoutMenu = (props: FlyoutProps) => {
  const [open, setOpen] = createSignal(false);
  let buttonRef: HTMLButtonElement | undefined;
  let menuRef: HTMLDivElement | undefined;

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef &&
      buttonRef &&
      !menuRef.contains(event.target as Node) &&
      !buttonRef.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

  return (
    <div class="relative">
      <button
        ref={buttonRef}
        type="button"
        class="inline-flex items-center gap-x-1 text-sm/6 font-semibold rounded-lg p-2  hover:text-gray-700 hover:bg-gray-50"
        aria-label="More options"
        aria-expanded={open()}
        aria-haspopup="menu"
        aria-controls="flyout-menu"
        onClick={() => {
          setOpen(!open());
        }}
      >
        <Icon name="ellipsisVertical" size="md" class="text-current" />
      </button>
      <Portal>
        <FlyoutTransition>
          <Show when={open() && !!buttonRef}>
            <div
              ref={menuRef}
              id="flyout-menu"
              role="menu"
              class="fixed z-50 "
              style={{
                top: (buttonRef as HTMLButtonElement).getBoundingClientRect().bottom + 5 + 'px',
                right:
                  window.innerWidth -
                  (buttonRef as HTMLButtonElement).getBoundingClientRect().right +
                  'px'
              }}
            >
              <div class="max-w-sm flex-auto rounded-md bg-white p-0 text-sm/6 shadow-lg ring-1 ring-gray-900/5">
                <For each={props.options}>
                  {(option) => (
                    <div class="text-gray-900 hover:text-gray-500 text-end">
                      <Show when={!option.onClick}>
                        <a href={option.link}>{getOptionContent(option)}</a>
                      </Show>
                      <Show when={option.onClick}>
                        <button onClick={option.onClick}>{getOptionContent(option)}</button>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </FlyoutTransition>
      </Portal>
    </div>
  );
};

const getOptionContent = (option: FlyoutOption) => {
  return (
    <div class="flex items-center p-2">
      <Show when={option.icon}>
        <Icon name={option.icon} size="sm" />
      </Show>
      <span>{option.label}</span>
    </div>
  );
};

interface FlyoutTransitionProps {
  children: JSX.Element;
}

const FlyoutTransition: Component<FlyoutTransitionProps> = (props) => {
  return (
    <Transition
      onEnter={createTransition(
        [
          { opacity: 0, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        {
          duration: 200,
          easing: 'ease-out'
        }
      )}
      onExit={createTransition(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(4px)' }
        ],
        {
          duration: 150,
          easing: 'ease-in'
        }
      )}
    >
      {props.children}
    </Transition>
  );
};
