import clsx from 'clsx';
import { createSignal, createUniqueId, JSXElement, mergeProps } from 'solid-js';
import Icon from '../Icon';

export interface CollapsibleProps {
  openLabel: string;
  closedLabel: string;
  children: JSXElement | JSXElement[];
  defaultOpen?: boolean;
  class?: string;
  buttonClass?: string;
}

export default function Collapsible(preProps: CollapsibleProps) {
  const props = mergeProps({ defaultOpen: false }, preProps);
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen);
  const contentId = createUniqueId();

  return (
    <>
      <button
        type="button"
        class={clsx(
          'flex w-full items-center gap-1 text-left text-xs text-gray-500 hover:text-gray-600',
          props.buttonClass
        )}
        onClick={() => setIsOpen(!isOpen())}
        aria-expanded={isOpen() ? 'true' : 'false'}
        aria-controls={contentId}
      >
        <span>{isOpen() ? props.openLabel : props.closedLabel}</span>
        <Icon name={isOpen() ? 'chevronUp' : 'chevronDown'} size="sm" />
      </button>
      <div id={contentId} class={clsx({ hidden: !isOpen() }, 'pt-2', props.class)}>
        {props.children}
      </div>
    </>
  );
}
