//Shoelace
import { Permission } from '@photonhealth/sdk/dist/types';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import { Spinner } from '@photonhealth/components';
import { JSXElement, Show, createMemo, mergeProps } from 'solid-js';
import { usePhotonWrapper } from '../store-context';

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
  const photon = usePhotonWrapper();

  const authenticated = createMemo(() => photon?.().authentication.state.isAuthenticated);
  const isLoading = createMemo(() => photon?.().authentication.state.isLoading, true);
  const inOrg = createMemo(() => photon?.().authentication.state.isInOrg);
  const hasPermission = createMemo(() =>
    checkHasPermission(props.permissions, photon?.().authentication.state.permissions || [])
  );

  const canAccess = createMemo(() => authenticated() && inOrg() && hasPermission());

  return (
    <Show when={!isLoading()}>
      <Show
        when={canAccess()}
        fallback={
          <Show
            when={!authenticated()}
            fallback={
              <Show
                when={!inOrg()}
                fallback={<AlertMessage message="You are not authorized to prescribe" />}
              >
                <AlertMessage message="You tried logging in with an account not associated with any organizations" />
              </Show>
            }
          >
            <Show
              when={photon?.().autoLogin}
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
