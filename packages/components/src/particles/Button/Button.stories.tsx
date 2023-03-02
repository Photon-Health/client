import Button, { ButtonProps } from '../Button';

import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';

type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  args: {
    variant: 'primary'
  }
};

export default {
  title: 'Button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['primary', 'secondary'],
      control: {
        type: 'select'
      }
    },
    size: {
      options: ['xl', 'lg', 'md', 'sm', 'xs'],
      control: {
        type: 'select'
      }
    }
  },
  render: (props) => <Button {...props}>hello</Button>
} as Meta<ComponentProps<typeof Button>>;
