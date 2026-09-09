import { clinicalGql } from '@photonhealth/sdk/test-utils';
import { screen, within } from '@testing-library/react';
import { HttpResponse } from 'msw';
import { beforeEach, expect, test } from 'vitest';

import { setupHarness } from '../../../../../test-utils';
import { Webhooks } from './Webhooks';

const SHARED_URL = 'https://example.com/hooks';

const webhooks = [
  { __typename: 'WebhookConfig', id: 'whk_first', url: SHARED_URL },
  { __typename: 'WebhookConfig', id: 'whk_second', url: SHARED_URL }
];

const { server, renderWithProviders } = setupHarness();

beforeEach(() => {
  server.use(
    clinicalGql.query('WebhookListQuery', () => HttpResponse.json({ data: { webhooks } }))
  );
});

test('renders an ID column header', async () => {
  renderWithProviders(<Webhooks />);

  expect(await screen.findByRole('columnheader', { name: /^id$/i })).toBeInTheDocument();
});

test('shows each webhook id so same-url webhooks can be told apart', async () => {
  renderWithProviders(<Webhooks />);

  expect(await screen.findByText('whk_first')).toBeInTheDocument();
  expect(screen.getByText('whk_second')).toBeInTheDocument();
  expect(screen.getAllByText(SHARED_URL)).toHaveLength(2);
});

test('each row pairs its id with its url', async () => {
  renderWithProviders(<Webhooks />);

  const row = (await screen.findByText('whk_second')).closest('tr') as HTMLElement;
  expect(within(row).getByText(SHARED_URL)).toBeInTheDocument();
});
