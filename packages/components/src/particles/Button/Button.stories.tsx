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
  render: (props) => <Button {...props}></Button>
} as Meta<ComponentProps<typeof Button>>;
