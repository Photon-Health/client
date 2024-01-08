import { ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { Maybe } from 'graphql/jsutils/Maybe';
import { createEffect, createSignal, JSXElement, Match, Ref, Switch } from 'solid-js';
import Button from '../../particles/Button';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import Spinner from '../../particles/Spinner';
import Text from '../../particles/Text';

const GetCurrentUserSignatureAttestationStatus = gql`
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

const AgreeToSignatureAttestation = gql`
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
  client: ApolloClient<any>
): Promise<DataReturn<GetCurrentUserSignatureAttestationStatusType>> => {
  return await client.query<GetCurrentUserSignatureAttestationStatusType>({
    query: GetCurrentUserSignatureAttestationStatus,
    fetchPolicy: 'cache-first'
  });
};

const agreeToSignatureAttestation =
  (client: ApolloClient<any>) =>
  async (version: string): Promise<DataReturn<Maybe<AgreeToSignatureAttestationType>>> => {
    return await client.mutate<AgreeToSignatureAttestationType, { version: string }>({
      mutation: AgreeToSignatureAttestation,
      variables: { version },
      refetchQueries: ['GetCurrentUserSignatureAttestationStatus'],
      awaitRefetchQueries: true,
      update: (cache, { data }) => {
        if (data?.agreeToSignatureAttestation) {
          cache.writeQuery({
            query: GetCurrentUserSignatureAttestationStatus,
            data: {
              me: {
                signatureAttestationStatus: {
                  __typename: 'CompletedSignatureAttestation',
                  agreedAt: new Date(),
                  version
                }
              }
            }
          });
        }
      }
    });
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
  let ref: Ref<any> | undefined;
  const [status, setStatus] = createSignal<Status>({ status: 'LOADING' });

  const refreshAttestationStatus = async () => {
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
  };

  const dispatchSignatureAttestationAgreed = () => {
    const event = new CustomEvent('photon-signature-attestation-agreed', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  const dispatchSignatureAttestationCanceled = () => {
    const event = new CustomEvent('photon-signature-attestation-canceled', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  createEffect(() => {
    if (status().status === 'COMPLETE') {
      dispatchSignatureAttestationAgreed();
    }
  });

  createEffect(() => {
    refreshAttestationStatus();
  });

  const onAgree = async () => {
    const curr = status();
    if (curr.status === 'NEEDS ATTESTATION') {
      const res = await agreeToSignatureAttestation(props.client)(curr.version);
      if (res.data?.agreeToSignatureAttestation) {
        setStatus({ status: 'COMPLETE' });
      } else if (res.error || res.errors) {
        setStatus({
          status: 'ERROR',
          errors: [
            ...(res.errors?.map((e) => e.message) ?? []),
            ...(res.error ? [res.error.message] : [])
          ]
        });
      }
    }
  };

  return (
    <>
      {/* This span is needed so we can easily dispatch events */}
      <span ref={ref} hidden />
      <Switch>
        <Match when={status().status === 'LOADING'}>
          <div class="flex justify-center w-full">
            <Spinner color="green" />
          </div>
        </Match>
        <Match when={status().status === 'COMPLETE'}>{props.children}</Match>
        <Match when={status().status === 'ERROR'}>
          <div class="text-red-700 font-bold flex space-x-2 items-center justify-center">
            <Icon name="exclamationCircle" />
            <span>An error occurred. Please refresh and try again</span>
          </div>
        </Match>
        <Match when={status().status === 'NEEDS ATTESTATION'}>
          <div class="w-full">
            <AgreementCard onAgree={onAgree} onCancel={dispatchSignatureAttestationCanceled} />
          </div>
        </Match>
      </Switch>
    </>
  );
};

const AgreementCard = (props: { onAgree: () => void; onCancel: () => void }) => (
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
        <Button variant="secondary" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={props.onAgree}>
          Agree
        </Button>
      </div>
    </div>
  </Card>
);
