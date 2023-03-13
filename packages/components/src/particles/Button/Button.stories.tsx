import Button, { ButtonProps } from '../Button';

import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';

type Theme = {
  theme: 'theme-photon' | 'theme-weekend';
};

type ButtonAndTheme = ButtonProps & Theme;

type Story = StoryObj<ButtonAndTheme>;

export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    theme: 'theme-photon'
  }
};

export default {
  title: 'Button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['primary', 'secondary'],
      defaultValue: 'primary',
      control: {
        type: 'select'
      }
    },
    size: {
      options: ['xl', 'lg', 'md', 'sm', 'xs'],
      defaultValue: 'lg',
      control: {
        type: 'select'
      }
    },
    theme: {
      options: ['theme-photon', 'theme-weekend'],
      defaultValue: 'photon',
      control: {
        type: 'select'
      }
    }
  },
  render: (props) => {
    const { theme, ...rest } = props;
    return (
      <div class={theme}>
        <Button {...rest}>Hello</Button>
      </div>
    );
  }
} as Meta<ComponentProps<typeof Button>>;
