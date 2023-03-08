import { customElement } from 'solid-element';
import { createEffect, createSignal } from 'solid-js';
import { PhotonContext } from '../context';
import { hasAuthParams, validateProps } from '../utils';
import { PhotonClient } from '@photonhealth/sdk';
import { PhotonClientStore } from '../store';
import { makeTimer } from '@solid-primitives/timer';

import { Client } from '@photonhealth/components';

type PhotonClientProps = {
  domain?: string;
  audience?: string;
  uri?: string;
  id?: string;
  redirectUri?: string;
  redirectPath?: string;
  org?: string;
  developmentMode?: boolean;
  errorMessage?: string;
  autoLogin: boolean;
};

customElement(
  'photon-client',
  {
    domain: {
      attribute: 'domain',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    id: {
      attribute: 'id',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    redirectUri: {
      attribute: 'redirect-uri',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    redirectPath: {
      attribute: 'redirect-path',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    org: {
      attribute: 'org',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    audience: {
      attribute: 'audience',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    uri: {
      attribute: 'uri',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    },
    developmentMode: {
      attribute: 'dev-mode',
      value: false,
      reflect: true,
      notify: false,
      parse: true
    },
    errorMessage: {
      attribute: 'error-message',
      value: "Oh snap! There was an error loading. Please contact your site's administrator",
      reflect: false,
      notify: false,
      parse: false
    },
    autoLogin: {
      attribute: 'auto-login',
      value: false,
      reflect: false,
      notify: false,
      parse: true
    }
  },
  ({
    domain,
    id,
    redirectUri,
    redirectPath,
    org,
    developmentMode,
    errorMessage,
    audience,
    uri,
    autoLogin
  }: PhotonClientProps) => {
    return (
      <Client
        domain
        id
        redirectUri
        redirectPath
        org
        developmentMode
        errorMessage
        audience
        uri
        autoLogin
      >
        <slot></slot>
      </Client>
    );
  }
);
