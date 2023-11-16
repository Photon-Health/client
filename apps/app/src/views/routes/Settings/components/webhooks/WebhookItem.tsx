import { Tr, Td, Badge, Button, Text } from '@chakra-ui/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { useClinicalApiClient } from '../../apollo';
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
  const client = useClinicalApiClient();
  const webhook = useFragment(webhookItemFragment, props.webhook);
  const [deleteMutation, { loading: deleteLoading }] = useMutation(webhookItemDeleteMutation, {
    client,
    refetchQueries: ['WebhookListQuery'],
    awaitRefetchQueries: true
  });

  const onDelete = useMemo(() => {
    return (webhookId: string) => {
      if (window.confirm("Are you sure? You can't undo this action afterwards.")) {
        deleteMutation({ variables: { webhookId } });
      }
    };
  }, [deleteMutation]);

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
          size="sm"
          variant="outline"
          borderColor="blue.500"
          textColor="blue.500"
          colorScheme="blue"
          isLoading={deleteLoading}
          onClick={() => onDelete(webhook.id)}
        >
          Delete
        </Button>
      </Td>
    </Tr>
  );
};
