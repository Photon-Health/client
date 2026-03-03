import clsx from 'clsx';
import { createSignal, createUniqueId, JSXElement, mergeProps, Show } from 'solid-js';
import Icon from '../Icon';

export interface CollapsibleProps {
  openLabel: string;
  closedLabel: string;
  children: JSXElement | JSXElement[];
  class?: string;
  buttonClass?: string;
  defaultOpen?: boolean;
  isOpen?: boolean;
  alwaysOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function Collapsible(preProps: CollapsibleProps) {
  const props = mergeProps({ defaultOpen: false }, preProps);
  const [internalOpen, setInternalOpen] = createSignal(props.defaultOpen);
  const contentId = createUniqueId();

  const isOpen = () => props.alwaysOpen || props.isOpen || internalOpen();

  return (
    <>
      <Show when={!props.alwaysOpen}>
        <button
          type="button"
          class={clsx(
            'flex w-full items-center gap-1 text-left text-xs text-gray-500 hover:text-gray-600',
            props.buttonClass
          )}
          onClick={() => {
            const result = !isOpen();
            setInternalOpen(result);
            props.onOpenChange?.(result);
          }}
          aria-expanded={isOpen() ? 'true' : 'false'}
          aria-controls={contentId}
        >
          <span>{isOpen() ? props.openLabel : props.closedLabel}</span>
          <Icon name={isOpen() ? 'chevronUp' : 'chevronDown'} size="sm" />
        </button>
      </Show>
      <div id={contentId} class={clsx({ hidden: !isOpen() }, 'pt-2', props.class)}>
        {props.children}
      </div>
    </>
  );
}
