import { Button } from '@photonhealth/components';
import { Show, JSX, createSignal, onMount } from 'solid-js';
import { usePhoton } from '../../../context';
import gql from 'graphql-tag';

const SignatureAttestation = (props: { onSubmit: () => void }) => {
  const onClick = () => {
    // do mutation
    props.onSubmit();
  };
  return (
    <div>
      <Button onClick={onClick}>Submit</Button>
    </div>
  );
};

const SIGNATURE_ATTESTATIONQUERY = gql`
  query MeQuery {
    me {
      name {
        first
        last
      }
    }
  }
`;

export const NeedsSignatureAttestationWrapper = (props: { children: JSX.Element }) => {
  const photon = usePhoton();

  const [needsAttestation, setNeedsAttestation] = createSignal<boolean>(true);

  onMount(() => {
    (async () => {
      const resp = (await photon!.clinicalApolloClient.query({ query: SIGNATURE_ATTESTATIONQUERY }))
        .data;
      console.log('resp', resp);
      setNeedsAttestation(resp.me.name.first === 'Michael');
    })();
  });

  const onSubmit = () => {
    setNeedsAttestation(false);
  };

  return (
    <Show when={!needsAttestation()} fallback={<SignatureAttestation onSubmit={onSubmit} />}>
      {props.children}
    </Show>
  );
};
