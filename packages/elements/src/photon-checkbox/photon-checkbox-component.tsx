import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import { createEffect, createSignal, onMount, Show } from 'solid-js';
import { PhotonTooltip } from '../photon-tooltip';

const Component = (props: {
  label?: string;
  required: boolean;
  disabled: boolean;
  checked: boolean;
  tip?: string;
}) => {
  const [checked, setChecked] = createSignal<boolean>(false);
  let ref: any;

  const dispatchChecked = (checked: boolean) => {
    const event = new CustomEvent('photon-checkbox-toggled', {
      composed: true,
      bubbles: true,
      detail: {
        checked
      }
    });
    ref?.dispatchEvent(event);
  };

  onMount(() => {
    setChecked(props.checked);
    dispatchChecked(checked());
  });

  createEffect(() => {
    if (props.checked !== checked()) {
      setChecked(props.checked);
    }
  });

  return (
    <>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <div class="flex items-start py-2">
        {props.checked ? (
          <sl-checkbox
            ref={ref}
            checked
            disabled={props.disabled}
            on:sl-change={() => {
              dispatchChecked(!checked());
              setChecked(!checked());
            }}
          />
        ) : (
          <sl-checkbox
            ref={ref}
            disabled={props.disabled}
            on:sl-change={() => {
              dispatchChecked(!checked());
              setChecked(!checked());
            }}
          />
        )}
        <div
          onClick={() => {
            dispatchChecked(!checked());
            setChecked(!checked());
          }}
          class="cursor-pointer"
        >
          <p class="flex items-center text-gray-500 text-sm font-medium font-sans">
            <span class="mr-1">{props.label} </span>
            <Show when={props.tip}>
              <PhotonTooltip tip={props.tip || ''} placement="right" />
            </Show>
          </p>
          <p class="text-gray-400 text-xs font-sans">{props.required ? 'Required' : 'Optional'}</p>
        </div>
      </div>
    </>
  );
};
customElement(
  'photon-checkbox',
  {
    label: undefined,
    required: false,
    disabled: false,
    checked: false,
    tip: undefined
  },
  Component
);
