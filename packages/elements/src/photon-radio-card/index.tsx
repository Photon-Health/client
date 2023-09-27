import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/radio/radio';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import tailwind from '../tailwind.css?inline';

customElement(
  'photon-radio-card',
  {
    selected: false,
    value: ''
  },
  (props: { selected: boolean; value: any }) => {
    let ref: any;

    const dispatchSelected = () => {
      const event = new CustomEvent('photon-radio-selected', {
        composed: true,
        bubbles: true,
        detail: {
          value: props.value
        }
      });
      ref?.dispatchEvent(event);
    };

    return (
      <div ref={ref} class="cursor-pointer">
        <style>{tailwind}</style>
        <photon-card on:click={() => dispatchSelected()}>
          <div class="flex items-center gap-2">
            <p class="font-sans flex-grow text-gray-600 text-sm">
              <slot />
            </p>
            <input type="radio" checked={props.selected} />
          </div>
        </photon-card>
      </div>
    );
  }
);
