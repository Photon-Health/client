import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, createSignal } from 'solid-js';
import Icon from '../Icon';
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
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Icon name="check" class="text-green-600" />
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h2>Prescription Sent</h2>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.
              </p>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 grid grid-cols-1">
            <Button onClick={() => setIsSmallOpen(false)}>Close</Button>
          </div>
        </Dialog>
        <Dialog size="lg" open={isLargeOpen()} onClose={() => setIsLargeOpen(false)}>
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Icon name="check" class="text-green-600" />
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h2>Prescription Sent</h2>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.
              </p>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 grid sm:grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setIsLargeOpen(false)}>
              Continue Editing
            </Button>
            <Button onClick={() => setIsLargeOpen(false)}>Close</Button>
          </div>
        </Dialog>
      </>
    );
  }
};

export const SmallOpen: DialogStory = {
  // @ts-ignore
  render: (args) => {
    return (
      <>
        <Dialog open={true} onClose={() => {}}>
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Icon name="check" class="text-green-600" />
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h2>Prescription Sent</h2>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.
              </p>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 grid grid-cols-1">
            <Button>Close</Button>
          </div>
        </Dialog>
      </>
    );
  }
};

export const LargeOpen: DialogStory = {
  // @ts-ignore
  render: (args) => {
    return (
      <>
        <Dialog size="lg" open={true} onClose={() => {}}>
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Icon name="check" class="text-green-600" />
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h2>Prescription Sent</h2>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.
              </p>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 grid sm:grid-cols-2 gap-2">
            <Button variant="secondary">Continue Editing</Button>
            <Button>Close</Button>
          </div>
        </Dialog>
      </>
    );
  }
};
