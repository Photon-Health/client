// https://www.solidjs.com/tutorial/bindings_directives
import { onCleanup } from 'solid-js';

type ClickOutsideAccessor = () => (() => void) | null | undefined;

export default function clickOutside(el: HTMLElement, accessor: ClickOutsideAccessor): void {
  const onClick = (e: MouseEvent) => {
    if (!el.contains(e.target as Node)) {
      accessor()?.();
    }
  };

  document.body.addEventListener('click', onClick);

  onCleanup(() => document.body.removeEventListener('click', onClick));
}
