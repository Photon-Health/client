//Shoelace
import { Permission } from '@photonhealth/sdk/dist/types';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import { JSXElement, mergeProps, Show, createMemo } from 'solid-js';
import { usePhoton } from '../context';
import { Spinner } from '@photonhealth/components';

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

  const isLoading = createMemo<boolean>(() => client?.authentication.state.isLoading || false);
  const isAuthenticated = createMemo<boolean>(
    () => client?.authentication.state.isAuthenticated || false
  );
  const isInOrg = createMemo<boolean>(() => client?.authentication.state.isInOrg || false);
  const hasPermission = createMemo<boolean>(() =>
    checkHasPermission(props.permissions, client?.authentication.state.permissions || [])
  );

  const canAccess = createMemo(() => isAuthenticated() && isInOrg() && hasPermission());

  return (
    <Show when={client && !isLoading()}>
      <Show
        when={canAccess()}
        fallback={
          <Show
            when={!isAuthenticated()}
            fallback={
              <Show
                when={!isInOrg()}
                fallback={<AlertMessage message="You are not authorized to prescribe" />}
              >
                <AlertMessage message="You tried logging in with an account not associated with any organizations" />
              </Show>
            }
          >
            <Show
              when={client?.autoLogin}
              fallback={<AlertMessage message="You are not signed in" />}
            >
              {/* 
                If using auto login, we expect that this will only momentarily be visible
                Either it'll kick out to an auth page, or it'll do the background OAuth dance
                In either case, a spinner is the correct design
              */}
              <div class="w-full flex justify-center">
                <Spinner color="green" />
              </div>
            </Show>
          </Show>
        }
      >
        {props.children}
      </Show>
    </Show>
  );
};
