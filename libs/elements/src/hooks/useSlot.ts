import { Accessor, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

export function useSlot(ref: Accessor<HTMLSlotElement | undefined>) {
  const [children, setChildren] = createStore(Array<Element>());
  createEffect(() => {
    if (!ref) return;
    const handler = () => {
      setChildren(ref()?.assignedElements() || []);
    };

    return ref()?.addEventListener('slotchange', handler);
  }, [ref]);
  return children;
}
