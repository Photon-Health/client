import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps } from 'solid-js';
import Icon, { IconSize, allIconNames } from '.';

type IconStory = StoryObj<ComponentProps<typeof Icon>>;

const meta: Meta<ComponentProps<typeof Icon>> = {
  title: 'Icon',
  component: Icon,
  argTypes: {}
};

export default meta;

export const DifferentSizes: IconStory = {
  // @ts-ignore
  render: (args) => {
    const sizes: IconSize[] = ['sm', 'md', 'lg', 'xl'];

    return (
      <div class="flex gap-4">
        {sizes.map((size) => (
          <div class="flex flex-col items-center">
            <Icon name="mapPin" size={size} />
            <span class="text-sm text-gray-500 mt-2">{size}</span>
          </div>
        ))}
      </div>
    );
  }
};

export const AllIcons: IconStory = {
  // @ts-ignore
  render: (args) => {
    return (
      <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 w-full">
        {allIconNames.map((iconName) => (
          <div class="flex flex-col items-center">
            <Icon name={iconName} />
            <span class="text-xs text-gray-500 mt-2">{iconName}</span>
          </div>
        ))}
      </div>
    );
  }
};
