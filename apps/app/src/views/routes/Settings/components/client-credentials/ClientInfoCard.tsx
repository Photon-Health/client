import { Box, Stack } from '@chakra-ui/react';

import { AppDescriptionView } from './AppDescriptionView';
import { AppNameView } from './AppNameView';
import { ClientIdView } from './ClientIdView';
import { ClientSecretView } from './ClientSecretView';
import { RotateSecret } from './RotateSecret';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';

const clientFragment = graphql(/* GraphQL */ `
  fragment ClientInfoCardFragment on Client {
    id
    appType
    name
    secret
  }
`);
interface ClientInfoCardProps {
  client: FragmentType<typeof clientFragment>;
}

export const ClientInfoCard = (props: ClientInfoCardProps) => {
  const client = useFragment(clientFragment, props.client);

  return (
    <Box as="form" {...props}>
      <Stack spacing={6}>
        <AppDescriptionView appType={client.appType} />
        <AppNameView name={client.name ?? 'Client'} />
        <ClientIdView clientId={client.id} />
        {client.appType !== 'spa' && (
          <>
            {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
            <ClientSecretView clientSecret={client.secret!} clientId={client.id} />
            <RotateSecret clientId={client.id} />
          </>
        )}
      </Stack>
    </Box>
  );
};
