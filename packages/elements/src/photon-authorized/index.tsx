//Shoelace
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

import { createEffect, createSignal, JSXElement, Show } from 'solid-js';
import { usePhoton } from '../context';

export const PhotonAuthorized = (props: { children: JSXElement }) => {
  const client = usePhoton();
  const [authorized, setAuthorized] = createSignal<boolean>(
    client?.authentication.state.isAuthorized || false
  );
  createEffect(() => {
    setAuthorized(client?.authentication.state.isAuthorized || false);
  }, [client?.authentication.state.isAuthenticated]);

  return (
    <>
      <Show when={client && !authorized()}>
        <sl-alert variant="warning" open>
          <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
          <strong>You are not authorized to prescribe</strong>
          <br />
        </sl-alert>
      </Show>
      <Show when={client && authorized()}>{props.children}</Show>
    </>
  );
};
