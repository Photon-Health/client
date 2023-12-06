import { useRecentOrders } from '.';
import Dialog from '../../particles/Dialog';

export default function RecentOrdersCancelDialog() {
  const [state, actions] = useRecentOrders();

  return (
    <Dialog open={state.isCancelDialogOpen} onClose={() => actions.setIsCancelDialogOpen(false)}>
      Cancel Order
    </Dialog>
  );
}
