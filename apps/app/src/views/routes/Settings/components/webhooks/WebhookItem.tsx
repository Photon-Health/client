import { Tr, Td, Badge, Button, Text } from '@chakra-ui/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { usePhoton } from 'packages/react';
import { useMutation } from '@apollo/client';
import { useMemo } from 'react';

const webhookItemFragment = graphql(/* GraphQL */ `
  fragment WebhookItemFragment on WebhookConfig {
    id
    url
  }
`);

const webhookItemDeleteMutation = graphql(/* GraphQL */ `
  mutation WebhookItemDeleteMutation($webhookId: ID!) {
    deleteWebhookConfig(webhookId: $webhookId)
  }
`);

export interface WebhookItemProps {
  webhook: FragmentType<typeof webhookItemFragment>;
}

export const WebhookItem = (props: WebhookItemProps) => {
  const { clinicalClient } = usePhoton();
  const webhook = useFragment(webhookItemFragment, props.webhook);
  const [deleteMutation, { loading: deleteLoading }] = useMutation(webhookItemDeleteMutation, {
    client: clinicalClient,
    refetchQueries: ['WebhookListQuery'],
    awaitRefetchQueries: true
  });

  const onDelete = useMemo(() => {
    return () => {
      if (window.confirm("Are you sure? You can't undo this action afterwards.")) {
        deleteMutation({ variables: { webhookId: webhook.id } });
      }
    };
  }, [deleteMutation, webhook.id]);

  return (
    <Tr key={webhook.id}>
      <Td>
        <Text color="muted">{webhook.url}</Text>
      </Td>
      <Td>
        <Badge size="sm" colorScheme="green">
          Active
        </Badge>
      </Td>
      <Td textAlign="end">
        <Button
          aria-label="Delete"
          size="xs"
          variant="outline"
          borderColor="red.500"
          textColor="red.500"
          colorScheme="red"
          isLoading={deleteLoading}
          onClick={onDelete}
        >
          Delete
        </Button>
      </Td>
    </Tr>
  );
};
