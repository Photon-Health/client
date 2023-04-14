import Button, { ButtonProps, ButtonVariant, ButtonSize } from '../Button';
import { For } from 'solid-js/web';
import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';

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
    const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'naked'];
    const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

    return (
      <>
        <For each={variants}>
          {(variant) => (
            <div class="flex items-start gap-6 mb-10">
              <For each={sizes}>
                {(size) => (
                  <Button variant={variant} size={size}>
                    {capitalizeFirstLetter(variant)} {capitalizeFirstLetter(size)} Button
                  </Button>
                )}
              </For>
            </div>
          )}
        </For>
        <div class="flex items-start gap-6 mb-10">
          <For each={variants}>
            {(variant) => (
              <Button variant={variant} disabled>
                Disabled
              </Button>
            )}
          </For>
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
    return (
      <div>
        <Button {...props}>Hello</Button>
      </div>
    );
  }
} as Meta<ComponentProps<typeof Button>>;
