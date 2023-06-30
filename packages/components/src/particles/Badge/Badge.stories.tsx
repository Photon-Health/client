import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, For } from 'solid-js';
import Badge, { BadgeProps, BadgeSize, BadgeColor } from './';

type BadgeStory = StoryObj<BadgeProps>;

const meta: Meta<ComponentProps<typeof Badge>> = {
  title: 'Badge',
  // @ts-ignore
  component: Badge,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: BadgeStory = {
  // @ts-ignore
  render: () => {
    const sizes: BadgeSize[] = ['md', 'sm'];
    const colors: BadgeColor[] = [
      'gray',
      'red',
      'yellow',
      'green',
      'blue',
      'indigo',
      'purple',
      'pink'
    ];

    return (
      <div class="max-w-md flex flex-col items-start">
        <For each={sizes}>
          {(size) => (
            <div class="mb-4">
              <h2 class="mb-2">{size === 'md' ? 'Medium' : 'Small'} Badges</h2>
              <div class="flex space-x-2">
                <For each={colors}>
                  {(color) => (
                    <Badge color={color} size={size}>
                      Badge
                    </Badge>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    );
  }
};
