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

export const ButtonBonanza: Story = {
  // @ts-ignore
  render: () => {
    return (
      <>
        <div class="flex items-start gap-8 mb-20">
          <Button variant="primary" size="xs">
            Button Text
          </Button>
          <Button variant="primary" size="sm">
            Button Text
          </Button>
          <Button variant="primary" size="md">
            Button Text
          </Button>
          <Button variant="primary" size="lg">
            Button Text
          </Button>
          <Button variant="primary" size="xl">
            Button Text
          </Button>
        </div>
        <div class="flex items-start gap-8 mb-20">
          <Button variant="secondary" size="xs">
            Button Text
          </Button>
          <Button variant="secondary" size="sm">
            Button Text
          </Button>
          <Button variant="secondary" size="md">
            Button Text
          </Button>
          <Button variant="secondary" size="lg">
            Button Text
          </Button>
          <Button variant="secondary" size="xl">
            Button Text
          </Button>
        </div>
        <div class="flex items-start gap-8 mb-20">
          <Button variant="tertiary" size="xs">
            Button Text
          </Button>
          <Button variant="tertiary" size="sm">
            Button Text
          </Button>
          <Button variant="tertiary" size="md">
            Button Text
          </Button>
          <Button variant="tertiary" size="lg">
            Button Text
          </Button>
          <Button variant="tertiary" size="xl">
            Button Text
          </Button>
        </div>
      </>
    );
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
