import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/radio/radio';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import { createSignal } from 'solid-js';
import { useSlot } from '../hooks/useSlot';

customElement('photon-radio-group', {}, () => {
  let ref: any;
  const [slotRef, setSlotRef] = createSignal<HTMLSlotElement | undefined>();
  const children = useSlot(slotRef);

  const dispatchSelected = (value: string) => {
    const event = new CustomEvent('photon-option-selected', {
      composed: true,
      bubbles: true,
      detail: {
        value: value
      }
    });
    ref?.dispatchEvent(event);
  };

  return (
    <div
      ref={ref}
      on:photon-radio-selected={(e: any) => {
        e.stopImmediatePropagation();
        e.stopPropagation();
        for (const child of children) {
          if (
            (child as any)['value'].id === e.detail.value.id ||
            (child as any)['value'] === e.detail.value
          ) {
            (child as any).selected = true;
          } else {
            (child as any).selected = false;
          }
        }
        dispatchSelected(e.detail.value);
      }}
    >
      <style>{tailwind}</style>
      <div class="flex flex-col gap-3">
        <slot ref={(r) => setSlotRef(r)}></slot>
      </div>
    </div>
  );
});
