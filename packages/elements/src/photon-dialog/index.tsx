import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';
import { Show } from 'solid-js';

type Proceed = 'photon-dialog-confirmed' | 'photon-dialog-alt' | 'photon-dialog-canceled';

customElement(
  'photon-dialog',
  {
    label: undefined,
    header: true,
    open: false,
    confirmText: 'Yes, Cancel',
    cancelText: 'No, Keep Editing',
    disableButtons: false,
    loading: false,
    hideFooter: false,
    disableSubmit: false,
    width: '500px',
    overlayClose: false
  },
  (props: {
    label?: string;
    header?: boolean;
    open: boolean;
    confirmText?: string;
    cancelText?: string;
    disableButtons: boolean;
    loading: boolean;
    hideFooter: boolean;
    disableSubmit: boolean;
    width?: string;
    overlayClose: boolean;
  }) => {
    let ref: any;

    const dispatchDecision = (proceed: Proceed) => {
      const event = new CustomEvent(proceed, {
        composed: true,
        bubbles: true,
        detail: {}
      });
      ref?.dispatchEvent(event);
    };

    return (
      <>
        <style>{tailwind}</style>
        <style>{shoelaceDarkStyles}</style>
        <style>{shoelaceLightStyles}</style>
        <style>{styles}</style>
        <sl-dialog
          class="dialog"
          classList={{
            hideFooter: props.hideFooter,
            showHeader: props.header
          }}
          style={`--width: ${props.width};`}
          ref={ref}
          label={props.label}
          open={props.open}
          no-header={!props.header}
          on:sl-request-close={(e: any) => {
            if (e.detail.source === 'overlay' && !props.overlayClose) {
              e.preventDefault();
            } else if (e.detail.source === 'keyboard') {
              e.preventDefault();
            } else {
              dispatchDecision('photon-dialog-canceled');
            }
          }}
        >
          <Show when={!props.header}>
            <slot name="label">
              <p class="text-xl font-sans font-medium">{props.label}</p>
            </slot>
          </Show>
          <div class={`font-sans ${!props.header ? 'py-4' : 'pb-4'}`}>
            <slot />
          </div>
          <div
            class="flex flex-col xs:flex-row justify-end gap-2"
            classList={{
              hidden: props.hideFooter
            }}
            slot="footer"
          >
            <photon-button
              variant="outline"
              disabled={props.disableButtons || props.loading}
              on:photon-clicked={() => {
                dispatchDecision('photon-dialog-alt');
              }}
            >
              {props.cancelText}
            </photon-button>
            <photon-button
              disabled={props.disableButtons || props.disableSubmit}
              loading={props.loading}
              on:photon-clicked={() => {
                dispatchDecision('photon-dialog-confirmed');
              }}
            >
              {props.confirmText}
            </photon-button>
          </div>
        </sl-dialog>
      </>
    );
  }
);
