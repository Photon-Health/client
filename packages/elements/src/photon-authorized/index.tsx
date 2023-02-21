//Shoelace
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

import { createEffect, createSignal, JSXElement, Show } from 'solid-js';
import { usePhoton } from '../context';

export const PhotonAuthorized = (props: { children: JSXElement }) => {
  const client = usePhoton();
  const [isLoading, setIsLoading] = createSignal<boolean>(
    client?.authentication.state.isLoading || false
  );
  const [authenticated, setAuthenticated] = createSignal<boolean>(
    client?.authentication.state.isAuthenticated || false
  );
  const [authorized, setAuthorized] = createSignal<boolean>(
    client?.authentication.state.isAuthorized || false
  );

  createEffect(() => {
    setIsLoading(client?.authentication.state.isLoading || false);
  });
  createEffect(() => {
    setAuthenticated(client?.authentication.state.isAuthenticated || false);
  });
  createEffect(() => {
    setAuthorized(client?.authentication.state.isAuthorized || false);
  });

  return (
    <>
      <Show when={client && !authenticated()}>
        <sl-alert variant="warning" open>
          <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
          <strong>You are not signed in</strong>
          <br />
        </sl-alert>
      </Show>
      <Show when={client && authenticated() && !authorized() && !isLoading()}>
        <sl-alert variant="warning" open>
          <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
          <strong>
            Something went wrong, please contact support at Photon Health{' '}
            <a style="text-decoration:underline" href="mailto:support@photon.health">
              support@photon.health
            </a>
          </strong>
          <br />
        </sl-alert>
      </Show>
      <Show when={client && authorized() && !isLoading()}>{props.children}</Show>
    </>
  );
};
