import { onCleanup } from 'solid-js';

type ClickOutsideAccessor = () => boolean;

export default function clickOutside(el: HTMLElement, accessor: ClickOutsideAccessor): void {
  const onClick = (e: MouseEvent) => {
    if (!el.contains(e.target as Node)) {
      accessor();
    }
  };

  document.body.addEventListener('click', onClick);

  onCleanup(() => document.body.removeEventListener('click', onClick));
}
