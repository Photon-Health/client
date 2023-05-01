//Shoelace Components
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

import { createSignal, onMount, createEffect, onCleanup } from 'solid-js';
import { customElement } from 'solid-element';
import { DoseCalculator } from '@photonhealth/components';

function SlSpinnerWrapper() {
  let parentEl: HTMLDivElement;

  createEffect(() => {
    if (customElements.get('sl-spinner')) {
      const spinnerElement = document.createElement('sl-spinner');
      if (parentEl) {
        parentEl.appendChild(spinnerElement);
      }

      onCleanup(() => {
        spinnerElement.remove();
      });
    }
  });

  return <div ref={parentEl}></div>;
}
function SlButtonWrapper({ text }: { text: string }) {
  let parentEl: HTMLDivElement;

  createEffect(() => {
    if (customElements.get('sl-button')) {
      const buttonElement = document.createElement('sl-button');
      buttonElement.textContent = text;
      if (parentEl) {
        parentEl.appendChild(buttonElement);
      }

      onCleanup(() => {
        buttonElement.remove();
      });
    }
  });

  return <div ref={parentEl}></div>;
}

customElement('photon-audit', {}, () => {
  const [open, setOpen] = createSignal(false);
  onMount(() => {
    console.log('');
    console.log(customElements.get('sl-spinner'));
  });

  return (
    <div>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <button onClick={() => setOpen(true)}>Open</button>
      <SlSpinnerWrapper />
      <SlButtonWrapper text="this is a button"></SlButtonWrapper>
      <DoseCalculator open={open()} setClose={() => setOpen(false)} />
    </div>
  );
});
