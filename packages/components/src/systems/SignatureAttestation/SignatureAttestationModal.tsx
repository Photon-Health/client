import { ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { createEffect, createSignal, JSXElement, Show } from 'solid-js';
import Button from '../../particles/Button';
import Card from '../../particles/Card';
import Spinner from '../../particles/Spinner';
import Text from '../../particles/Text';
import { Maybe } from 'graphql/jsutils/Maybe';
import Icon from '../../particles/Icon';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _GetCurrentUserSignatureAttestationStatus = gql`
  query GetCurrentUserSignatureAttestationStatus {
    me {
      signatureAttestationStatus {
        ... on NeedsSignatureAttestation {
          version
          content
        }
        ... on CompletedSignatureAttestation {
          agreedAt
          version
        }
        ... on NotApplicableSignatureAttestation {
          reason
        }
      }
    }
  }
`;

export type GetCurrentUserSignatureAttestationStatusType = {
  me?: {
    signatureAttestationStatus?:
      | {
          __typename: 'NeedsSignatureAttestation';
          version: string;
          content: string;
        }
      | {
          __typename: 'CompletedSignatureAttestation';
          agreedAt: Date;
          version: string;
        }
      | {
          __typename: 'NotApplicableSignatureAttestation';
          reason: string | null | undefined;
        };
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _AgreeToSignatureAttestation = gql`
  mutation AgreeToSignatureAttestation($version: String!) {
    agreeToSignatureAttestation(version: $version)
  }
`;

export type AgreeToSignatureAttestationType = {
  agreeToSignatureAttestation?: boolean;
};

type DataReturn<Type> = {
  data?: Type;
  loading?: boolean;
  error?: any;
  errors?: readonly any[];
};

const getCurrentUserSignatureAttestationStatus = async (
  _client: ApolloClient<any>
): Promise<DataReturn<GetCurrentUserSignatureAttestationStatusType>> => {
  return {
    data: {
      me: {
        signatureAttestationStatus: {
          __typename: 'NeedsSignatureAttestation',
          version: '1.0.0',
          content: 'blah'
        }
      }
    }
  };
  // return await _client.query<GetCurrentUserSignatureAttestationStatusType>({
  //   query: GetCurrentUserSignatureAttestationStatus
  // });
};

const agreeToSignatureAttestation =
  (_client: ApolloClient<any>) =>
  async (_version: string): Promise<DataReturn<Maybe<AgreeToSignatureAttestationType>>> => {
    return { data: { agreeToSignatureAttestation: true } };
  };

export interface SignatureAttestationModalProps {
  client: ApolloClient<any>;
  children: JSXElement;
}

type Status =
  | {
      status: 'LOADING';
    }
  | { status: 'NEEDS ATTESTATION'; version: string }
  | { status: 'COMPLETE' }
  | { status: 'ERROR'; errors: any[] };

export const SignatureAttestationModal = (props: SignatureAttestationModalProps) => {
  const [status, setStatus] = createSignal<Status>({ status: 'LOADING' });

  createEffect(() => {
    (async () => {
      const req = await getCurrentUserSignatureAttestationStatus(props.client);
      if (req.error || req.errors) {
        setStatus({
          status: 'ERROR',
          errors: [
            ...(req.errors?.map((e) => e.message) ?? []),
            ...(req.error ? [req.error.message] : [])
          ]
        });
      } else if (!req.data?.me?.signatureAttestationStatus) {
        setStatus({
          status: 'ERROR',
          errors: ['Could not get user data. Please refresh and try again']
        });
      } else if (
        req.data?.me?.signatureAttestationStatus?.__typename === 'CompletedSignatureAttestation' ||
        req.data?.me?.signatureAttestationStatus?.__typename === 'NotApplicableSignatureAttestation'
      ) {
        setStatus({ status: 'COMPLETE' });
      } else
        setStatus({
          status: 'NEEDS ATTESTATION',
          version: req.data.me.signatureAttestationStatus.version
        });
    })();
  });

  const [onAgree] = createSignal(() => () => {
    const curr = status();
    if (curr.status === 'NEEDS ATTESTATION') {
      agreeToSignatureAttestation(props.client)(curr.version);
    }
  });

  return (
    <div>
      <Show when={status().status === 'LOADING'}>
        <div />
      </Show>
      <Show when={status().status === 'COMPLETE'}>{props.children}</Show>
      <Show when={status().status === 'ERROR'}>
        <Spinner />
      </Show>
      <Show when={status().status === 'NEEDS ATTESTATION'}>
        <AgreementCard onAgree={onAgree} />
      </Show>
    </div>
  );
};

const AgreementCard = (props: { onAgree: () => void }) => (
  <Card>
    <div class="flex flex-col space-y-5">
      <div class="bg-[#FFFAEB] flex text-[#DC6803] py-2 font-semibold items-center text-sm">
        <Icon name="informationCircle" class="mx-2" />
        Required before writing prescriptions
      </div>
      <div class="space-y-3">
        <Text bold size="xl">
          Prescriber Signature Attestation
        </Text>
        <Text class="block">
          Photon Health, Inc. attaches your signature image to the digital signature and timestamp
          associated with an authorized digital prescription; or digital prescription reproduced as
          a hard copy facsimile.
        </Text>
        <Text class="block">
          In order to send prescriptions via the Photon application, you must be personally
          logged-in at the time of prescribe to approve the prescription to be created.
        </Text>
        <p class="text-base">
          By selecting <span class="font-bold">Agree</span>, you approve any prescriptions you
          create and send via Photon Health, Inc and that you are a practitioner authorized to
          prescribe and licensed in the relevant state. This signature image will not be used for
          any other purposes.
        </p>
      </div>
      <div class="flex justify-end space-x-4">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" onClick={props.onAgree}>
          Agree
        </Button>
      </div>
    </div>
  </Card>
);
