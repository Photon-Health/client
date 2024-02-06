import { customElement } from 'solid-element';

import { Icon } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { onMount, Show } from 'solid-js';
import PhotonTooltip from '../photon-tooltip';

//Shoelace
import '@shoelace-style/shoelace/dist/components/textarea/textarea';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import '@shoelace-style/shoelace/dist/components/icon/icon';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';

customElement(
  'photon-textarea',
  {
    label: undefined,
    required: false,
    placeholder: undefined,
    value: undefined,
    formName: undefined,
    helpText: undefined,
    invalid: false,
    disabled: false,
    verified: undefined
  },
  (props: {
    label?: string;
    required: boolean;
    placeholder?: string;
    value?: string;
    formName?: string;
    helpText?: string;
    invalid: boolean;
    disabled: boolean;
    verified?: boolean;
  }) => {
    let ref: any;

    const dispatchInputChanged = (value: string) => {
      const event = new CustomEvent('photon-textarea-changed', {
        composed: true,
        bubbles: true,
        detail: {
          value: value
        }
      });
      ref?.dispatchEvent(event);
    };

    onMount(() => {
      dispatchInputChanged(props.value ?? '');
    });

    return (
      <>
        <style>{photonStyles}</style>
        <style>{tailwind}</style>
        <style>{shoelaceDarkStyles}</style>
        <style>{shoelaceLightStyles}</style>
        <style>{styles}</style>
        <div class="sm:py-2 flex flex-col" ref={ref}>
          {props.label ? (
            <div class="flex justify-between pb-2">
              <div>
                <p class="text-gray-700 text-sm">
                  {props.label}{' '}
                  {props.required ? (
                    <span class="pl-1 text-red-500">*</span>
                  ) : (
                    <span class="text-gray-400 text-xs pl-2">Optional</span>
                  )}
                </p>
              </div>

              {props.verified !== undefined ? (
                props.verified ? (
                  <div class="text-left sm:text-right text-green-500 flex gap-2 cursor-pointer items-center h-full">
                    <Show when={true}>
                      <Icon name="check" size="sm" />
                      <sl-tooltip
                        content="This SIG follows the suggested format: Action + Quantity + Form/Measurement + Route + Frequency + Time"
                        placement="top-start"
                        style={{ '--max-width': '400px' }}
                      >
                        <a class="font-sans text-sm">Verified</a>
                      </sl-tooltip>
                    </Show>
                  </div>
                ) : (
                  <div class="text-left sm:text-right text-red-500 flex gap-2 cursor-pointer items-center h-full">
                    <Show when={true}>
                      <Icon name="xMark" size="sm" />
                      <sl-tooltip
                        content={`Missing “Route” in following format: Action + Quantity + Form/Measurement + Route + Frequency + Time`}
                        placement="top-start"
                        style={{ '--max-width': '400px' }}
                      >
                        <a class="font-sans text-sm">Incomplete</a>
                      </sl-tooltip>
                    </Show>
                  </div>
                )
              ) : null}
            </div>
          ) : null}
          <sl-textarea
            on:sl-input={(e: any) => {
              dispatchInputChanged(e.target.value);
            }}
            classList={{
              invalid: props.invalid
            }}
            class="input"
            disabled={props.disabled}
            invalid={props.invalid}
            value={props.value ? props.value : ''}
            placeholder={props.placeholder}
          >
            <p slot="help-text" class="text-red-500 pt-1 h-[21px] font-sans">
              {props.helpText}
            </p>
          </sl-textarea>
        </div>
      </>
    );
  }
);
