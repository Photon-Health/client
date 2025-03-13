import { Box, Stack } from '@chakra-ui/react';

import { AppDescriptionView } from './AppDescriptionView';
import { AppNameView } from './AppNameView';
import { ClientIdView } from './ClientIdView';
import { ClientSecretView } from './ClientSecretView';
import { RotateSecret } from './RotateSecret';
import { SPAClientEditForm } from './SPAClientEditForm';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';

const clientFragment = graphql(/* GraphQL */ `
  fragment ClientInfoCardFragment on Client {
    id
    appType
    name
    secret
    whiteListedUrls
  }
`);

interface ClientInfoCardProps {
  clientCreds: FragmentType<typeof clientFragment>;
}

export const ClientInfoCard = (props: ClientInfoCardProps) => {
  const clientCreds = useFragment(clientFragment, props.clientCreds);

  return (
    <Box>
      <Stack spacing={6}>
        <AppDescriptionView appType={clientCreds.appType} />
        <AppNameView name={clientCreds.name ?? 'Client'} />
        <ClientIdView clientId={clientCreds.id} />
        {clientCreds.appType === 'spa' ? (
          <SPAClientEditForm
            clientId={clientCreds.id}
            whiteListedUrls={clientCreds.whiteListedUrls}
          />
        ) : (
          <>
            {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
            <ClientSecretView clientSecret={clientCreds.secret!} clientId={clientCreds.id} />
            <RotateSecret clientId={clientCreds.id} />
          </>
        )}
      </Stack>
    </Box>
  );
};
