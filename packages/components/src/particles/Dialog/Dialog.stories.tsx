import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, createSignal } from 'solid-js';
import Dialog, { DialogProps } from '.';
import Button from '../Button';

type DialogStory = StoryObj<DialogProps>;

const meta: Meta<ComponentProps<typeof Dialog>> = {
  title: 'Dialog',
  // @ts-ignore
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: DialogStory = {
  // @ts-ignore
  render: (args) => {
    const [isSmallOpen, setIsSmallOpen] = createSignal(false);
    const [isLargeOpen, setIsLargeOpen] = createSignal(false);

    return (
      <>
        <div class="flex gap-4">
          <Button onClick={() => setIsSmallOpen(true)}>Open Regular Dialog</Button>
          <Button onClick={() => setIsLargeOpen(true)}>Open Larger Dialog</Button>
        </div>
        <Dialog open={isSmallOpen()} onClose={() => setIsSmallOpen(false)}>
          Hello hi
        </Dialog>
        <Dialog size="lg" open={isLargeOpen()} onClose={() => setIsLargeOpen(false)}>
          Hello hi
        </Dialog>
      </>
    );
  }
};
