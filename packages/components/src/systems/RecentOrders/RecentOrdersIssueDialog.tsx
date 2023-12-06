import { createEffect } from 'solid-js';
import { useRecentOrders } from '.';
import Dialog from '../../particles/Dialog';

export default function RecentOrdersIssueDialog() {
  const [state, actions] = useRecentOrders();
  createEffect(() => {
    console.log(state.isIssueDialogOpen);
  });
  return (
    <Dialog open={state.isIssueDialogOpen} onClose={() => actions.setIsIssueDialogOpen(false)}>
      Report Issue
    </Dialog>
  );
}
