//Shoelace
import '@shoelace-style/shoelace/dist/components/alert/alert';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import { createEffect, createSignal, JSXElement, mergeProps, Show, createMemo } from 'solid-js';
import { usePhoton } from '@photonhealth/components';
import { Spinner, Alert } from '@photonhealth/components';
import { checkHasPermission } from '../utils';
import { Permission } from '@photonhealth/sdk/dist/types';

function AlertMessage(props: { message: string }) {
  return <Alert type="error" header="Unauthorized" message={props.message} />;
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
                fallback={<AlertMessage message="You are not authorized to prescribe" />}
              >
                <AlertMessage message="You tried logging in with an account not associated with any organizations. Please check your email for an invite, or ask your administrator for assistance." />
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
