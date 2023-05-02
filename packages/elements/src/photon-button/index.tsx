import { customElement } from 'solid-element';

//Shoelace
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';

customElement(
  'photon-button',
  {
    disabled: false,
    loading: false,
    loadingText: undefined,
    full: false,
    variant: 'solid',
    size: 'md'
  },
  (props: {
    disabled: boolean;
    loading: boolean;
    full: boolean;
    loadingText?: string;
    variant?: string;
    size?: 'lg' | 'md' | 'sm' | 'xs';
  }) => {
    let ref: any;
    const dispatchClick = () => {
      const event = new CustomEvent('photon-clicked', {
        composed: true,
        bubbles: true,
        detail: {}
      });
      ref?.dispatchEvent(event);
    };

    // default medium size
    let textSize = 'text-sm lg:text-base';
    if (props.size === 'lg') {
      textSize = 'text-base lg:text-lg';
    }
    if (props.size === 'sm') {
      textSize = 'text-xs lg:text-sm';
    }
    if (props.size === 'xs') {
      textSize = 'text-xs';
    }
    return (
      <>
        <style>{tailwind}</style>
        <style>{shoelaceDarkStyles}</style>
        <style>{shoelaceLightStyles}</style>
        <style>{styles}</style>
        <button
          ref={ref}
          disabled={props.disabled || props.loading}
          onclick={() => dispatchClick()}
          classList={{
            button: true,
            'button--solid': props.variant === 'solid',
            'button--outline': props.variant === 'outline',
            'button--lg': props.size == 'lg',
            'button--md': props.size == 'md',
            'button--sm': props.size == 'sm',
            'button--xs': props.size == 'xs',
            'xs:w-fit': true,
            'w-full': true || props.full
          }}
          class="rounded-lg font-sans transition ease-in-out delay-50 flex items-center gap-1 lg:gap-2"
        >
          <slot name="suffix"></slot>
          {props.loading ? (
            <div class="pt-[3px]">
              <sl-spinner
                class="w-[16px]"
                classList={{
                  'spinner--solid': props.variant === 'solid',
                  'spinner--outline': props.variant === 'outline'
                }}
              ></sl-spinner>
            </div>
          ) : null}

          <p class={`w-full ${textSize}`}>
            <slot></slot>
          </p>
          <slot name="postfix"></slot>
        </button>
      </>
    );
  }
);
