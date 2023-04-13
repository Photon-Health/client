import Spinner, { SpinnerProps } from '.';
import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';

type SpinnerStory = StoryObj<SpinnerProps>;

export const Default: SpinnerStory = {
  args: {
    size: 'lg'
  }
};

export const MultipleSpinners: SpinnerStory = {
  // @ts-ignore
  render: () => (
    <div class="flex gap-4">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  )
};

export default {
  title: 'Spinner',
  tags: ['autodocs'],
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg', 'xl'],
      defaultValue: 'lg',
      control: {
        type: 'select'
      }
    }
  },
  render: (props) => {
    return (
      <div>
        <Spinner {...props} />
      </div>
    );
  }
} as Meta<ComponentProps<typeof Spinner>>;
