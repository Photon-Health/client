import { customElement } from 'solid-element';

import { useSlot } from '../hooks/useSlot';

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import { createSignal, Signal } from 'solid-js';

customElement(
  'photon-form',
  {
    submitLabel: undefined
  },
  (
    props: {
      submitLabel?: string;
    },
    options
  ) => {
    let outerRef: any;
    const [ref, setRef]: Signal<HTMLSlotElement | undefined> = createSignal(undefined);
    const [invalid, setInvalid] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    const children = useSlot(ref);
    let formData = new Map<string, any>();

    const dispatchSubmit = () => {
      const event = new CustomEvent('photon-submit-success', {
        composed: true,
        bubbles: true,
        detail: {
          data: formData
        }
      });
      outerRef?.dispatchEvent(event);
    };

    const dispatchError = () => {
      const event = new CustomEvent('photon-submit-error', {
        composed: true,
        bubbles: true,
        detail: {}
      });
      outerRef?.dispatchEvent(event);
    };

    options.element['getForm'] = () => {
      return formData;
    };

    options.element['updateForm'] = (fd: Map<string, any>) => {
      formData = fd;
      if (children.length > 0) {
        formData.set('setLoading', (loading: boolean) => {
          setLoading(loading);
        });
        formData.set('checkValidity', () => checkValidity());
        const photonEls: any[] = [];
        children.forEach((x: any) => {
          collectPhotonElements(x, photonEls);
        });
        photonEls.forEach((x) => {
          if (x['addForm']) {
            x.addForm(formData);
          }
        });
      }
    };

    return (
      <div ref={outerRef}>
        <style>{tailwind}</style>
        <style>{shoelaceDarkStyles}</style>
        <style>{shoelaceLightStyles}</style>
        <div class="flex flex-col">
          <slot ref={(r) => setRef(r)}></slot>
          <div class="flex xs:self-end pb-4">
            <photon-button
              class="flex-grow"
              disabled={invalid()}
              loading={loading()}
              on:photon-clicked={() => {
                checkValidity();
                if (invalid()) {
                  dispatchError();
                } else {
                  dispatchSubmit();
                }
              }}
            >
              {props.submitLabel || 'Submit'}
            </photon-button>
          </div>
        </div>
      </div>
    );
  }
);
