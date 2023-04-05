import Spinner, { SpinnerProps } from '.';
import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';

type SpinnerStory = StoryObj<SpinnerProps>;

export const Default: SpinnerStory = {
  args: {
    size: 'lg'
  }
};

export const MultipleInputs: SpinnerStory = {
  // @ts-ignore
  render: () => (
    <div class="flex gap-4">
      <Spinner size="s" />
      <Spinner size="m" />
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
      options: ['s', 'm', 'lg', 'xl'],
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
