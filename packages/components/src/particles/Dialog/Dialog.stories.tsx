import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, createSignal } from 'solid-js';
import Dialog, { DialogProps } from '.';

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
    const [isOpen, setIsOpen] = createSignal(false);

    return (
      <>
        <button onClick={() => setIsOpen(true)}>Open Dialog</button>
        <Dialog open={isOpen()} onClose={() => setIsOpen(false)}>
          Hello
        </Dialog>
      </>
    );
  }
};
