//Shoelace
import '@shoelace-style/shoelace/dist/components/alert/alert';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import { createEffect, createSignal, JSXElement, mergeProps, Show } from 'solid-js';
import { Permission } from '../../types';
import { usePhoton } from '../context';

function checkHasPermission(subset: Permission[], superset: Permission[]) {
  for (let i = 0; i < subset.length; i++) {
    if (superset.indexOf(subset[i]) === -1) {
      return false;
    }
  }
  return true;
}

export const PhotonAuthorized = (p: { children: JSXElement; permissions?: Permission[] }) => {
  const props = mergeProps({ permissions: [] }, p);
  const client = usePhoton();
  const [isLoading, setIsLoading] = createSignal<boolean>(
    client?.authentication.state.isLoading || false
  );
  const [authenticated, setAuthenticated] = createSignal<boolean>(
    client?.authentication.state.isAuthenticated || false
  );
  const [inOrg, setInOrg] = createSignal<boolean>(client?.authentication.state.isInOrg || false);
  const [hasPermission, setHasPermission] = createSignal<boolean>(
    checkHasPermission(props.permissions, client?.authentication.state.permissions || [])
  );

  createEffect(() => {
    setIsLoading(client?.authentication.state.isLoading || false);
  });
  createEffect(() => {
    setAuthenticated(client?.authentication.state.isAuthenticated || false);
  });
  createEffect(() => {
    setInOrg(client?.authentication.state.isInOrg || false);
  });
  createEffect(() => {
    setHasPermission(
      checkHasPermission(props.permissions, client?.authentication.state.permissions || [])
    );
  });

  return (
    <>
      <Show when={client && !isLoading()}>
        <Show when={!authenticated()}>
          <sl-alert variant="warning" open>
            <sl-icon slot="icon" name="exclamation-triangle" />
            <strong>You are not signed in</strong>
            <br />
          </sl-alert>
        </Show>
        <Show when={authenticated() && (!inOrg() || !hasPermission())}>
          <sl-alert variant="warning" open>
            <sl-icon slot="icon" name="exclamation-triangle" />
            <strong>
              Something went wrong, please contact support at Photon Health{' '}
              <a style={{ 'text-decoration': 'underline' }} href="mailto:support@photon.health">
                support@photon.health
              </a>
            </strong>
            <br />
          </sl-alert>
        </Show>
        <Show when={inOrg() && hasPermission()}>{props.children}</Show>
      </Show>
    </>
  );
};
