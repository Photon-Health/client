import { customElement } from 'solid-element';
import { createEffect, createMemo, Show } from 'solid-js';

import '../photon-login';

//Shoelace
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import { usePhotonWrapper } from '../store-context';
import tailwind from '../tailwind.css?inline';

customElement(
  'photon-auth-wrapper',
  {
    autoLogin: false,
    hideLoader: false,
    redirectPath: {
      attribute: 'redirect-path',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    }
  },
  (props: { autoLogin: boolean; hideLoader: boolean; redirectPath?: string }) => {
    const photon = usePhotonWrapper();

    if (!photon) {
      console.error(
        '[photon-auth-wrapper] No valid PhotonClient instance was provided. Please ensure you are wrapping the element in a photon-photon element'
      );
      return (
        <div>
          [photon-auth-wrapper] No valid PhotonClient instance was provided. Please ensure you are
          wrapping the element in a photon-photon element
        </div>
      );
    }

    const authenticated = createMemo(() => photon().authentication.state.isAuthenticated, false);
    const isLoading = createMemo(() => photon().authentication.state.isLoading, true);

    createEffect(() => {
      if (!isLoading() && !authenticated() && props.autoLogin) {
        const args = { appState: props.redirectPath ? { returnTo: props.redirectPath } : {} };
        photon().authentication.login(args);
      }
    });

    return (
      <>
        <style>{tailwind}</style>
        <style>{shoelaceDarkStyles}</style>
        <style>{shoelaceLightStyles}</style>
        <Show when={authenticated()}>
          <slot />
        </Show>
        <Show when={!authenticated() && !isLoading() && !props.autoLogin}>
          <photon-login redirect-path={props.redirectPath} />
        </Show>
        <Show when={isLoading() && !props.hideLoader}>
          <div class="w-full flex justify-center">
            <sl-spinner style={{ 'font-size': '3rem' }} />
          </div>
        </Show>
      </>
    );
  }
);
