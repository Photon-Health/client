//Shoelace
import { Permission } from '@photonhealth/sdk/dist/types';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import { createEffect, createSignal, JSXElement, mergeProps, Show, createMemo } from 'solid-js';
import { usePhoton } from '../context';

function checkHasPermission(subset: Permission[], superset: Permission[]) {
  return subset.every((permission) => superset.includes(permission));
}

function AlertMessage(props: { message: string }) {
  return (
    <sl-alert variant="warning" open>
      <sl-icon slot="icon" name="exclamation-triangle" />
      <strong>{props.message}</strong>
      <br />
    </sl-alert>
  );
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
  const [user, setUser] = createSignal(JSON.stringify(client?.authentication.state.user) || '');

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
  createEffect(() => {
    setUser(JSON.stringify(client?.authentication.state.user) || '');
  });

  const canAccess = createMemo(() => authenticated() && inOrg() && hasPermission());

  return (
    <Show when={client && !isLoading()}>
      <Show
        when={canAccess()}
        fallback={
          <Show
            when={!authenticated()}
            fallback={
              <Show
                when={!inOrg()}
                fallback={
                  <AlertMessage message={`You are not authorized to prescribe: ${user()}`} />
                }
              >
                <AlertMessage message="You tried logging in with an account not associated with any organizations" />
              </Show>
            }
          >
            <AlertMessage message="You are not signed in" />
          </Show>
        }
      >
        {props.children}
      </Show>
    </Show>
  );
};
