import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { useContext } from 'solid-js';
import { vi } from 'vitest';
import { MockPhotonClient } from '../TestMocks/MockSDKProvider';
import {
  MockDraftPrescriptionsContext,
  MockDraftPrescriptionsProvider
} from '../TestMocks/MockDraftPrescriptionsProvider';
import { PrescribeEventDispatchProvider } from '../PrescribeEventDispatchProvider';
import RecentOrders, { useRecentOrders } from '.';

vi.mock('../SDKProvider', () => ({
  usePhotonClient: () => new MockPhotonClient()
}));

vi.mock('../DraftPrescriptions', () => ({
  useDraftPrescriptions: () => useContext(MockDraftPrescriptionsContext)
}));

vi.mock('../../utils/createQuery', () => ({
  createQuery: () => Object.assign(() => undefined, { loading: false })
}));

beforeEach(() => {
  Element.prototype.animate = vi
    .fn()
    .mockReturnValue({ finished: Promise.resolve() } as unknown as Animation);
});

afterEach(() => {
  cleanup();
});

function OpenDialogButton(props: { createOrder: () => Promise<void> }) {
  const [, actions] = useRecentOrders();
  return (
    <button type="button" onClick={() => actions.setIsCombineDialogOpen(true, props.createOrder)}>
      Send order
    </button>
  );
}

const renderSubject = (createOrder: () => Promise<void>) =>
  render(() => (
    <PrescribeEventDispatchProvider>
      <MockDraftPrescriptionsProvider>
        <RecentOrders patientId="test-patient-id">
          <OpenDialogButton createOrder={createOrder} />
          <RecentOrders.CombineDialog />
        </RecentOrders>
      </MockDraftPrescriptionsProvider>
    </PrescribeEventDispatchProvider>
  ));

test('is usable again after creating a new order finishes', async () => {
  const user = userEvent.setup();
  const createOrder = vi.fn().mockResolvedValue(undefined);
  renderSubject(createOrder);

  await user.click(screen.getByRole('button', { name: 'Send order' }));
  await user.click(screen.getByRole('button', { name: 'No, send new order' }));

  expect(createOrder).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Add prescription to recent order?')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Send order' }));

  expect(screen.getByRole('button', { name: 'No, send new order' })).toBeEnabled();
});
