import { useRecentOrders } from '.';
import Dialog from '../../particles/Dialog';

export default function RecentOrdersDuplicateDialog() {
  const [state, actions] = useRecentOrders();

  return (
    <Dialog
      open={state.isDuplicateDialogOpen}
      onClose={() => actions.setIsDuplicateDialogOpen(false)}
    >
      Duplicate Order
    </Dialog>
  );
}
