import { customElement } from 'solid-element';
import { createEffect, createSignal, Show } from 'solid-js';
import { usePhoton } from '@photonhealth/components';

import '../photon-login';

//Shoelace
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';

const Component = (props: { autoLogin: boolean; hideLoader: boolean; redirectPath?: string }) => {
  const client = usePhoton();
  const [authenticated, setAuthenticated] = createSignal<boolean>(false);
  const [isLoading, setIsLoading] = createSignal<boolean>(true);

  createEffect(() => {
    if (!client) {
      console.error(
        '[photon-auth-wrapper] No valid PhotonClient instance was provided. Please ensure you are wrapping the element in a photon-client element'
      );
    }
  });

  createEffect(() => {
    if (!client?.authentication.state.isLoading) {
      setIsLoading(false);
      if (!client?.authentication.state.isAuthenticated && props.autoLogin) {
        const args: any = { appState: {} };
        if (props.redirectPath) {
          args.appState.returnTo = props.redirectPath;
        }
        client?.authentication.login(args);
      }
      setAuthenticated(client?.authentication.state.isAuthenticated || false);
    } else {
      setIsLoading(true);
    }
  });

  return (
    <>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <Show when={client && authenticated()}>
        <slot />
      </Show>
      <Show when={client && !authenticated() && !isLoading() && !props.autoLogin}>
        <photon-login redirect-path={props.redirectPath} />
      </Show>
      <Show when={client && isLoading() && !props.hideLoader}>
        <div class="w-full flex justify-center">
          <sl-spinner style={{ 'font-size': '3rem' }} />
        </div>
      </Show>
    </>
  );
};
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
  Component
);
