import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps } from 'solid-js';
import { IconButton } from '.';
import { IconSize, allIconNames } from '../Icon';

type IconButtonStory = StoryObj<ComponentProps<typeof IconButton>>;

const meta: Meta<ComponentProps<typeof IconButton>> = {
  title: 'IconButton',
  // @ts-ignore
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    iconName: {
      control: 'select',
      options: allIconNames.slice(0, 10) // Just show first 10 icons for brevity
    },
    iconSize: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl']
    },
    disabled: {
      control: 'boolean'
    },
    loading: {
      control: 'boolean'
    }
  }
};

export default meta;

export const DifferentSizes: IconButtonStory = {
  // @ts-ignore
  render: (args) => {
    const sizes: IconSize[] = ['sm', 'md', 'lg', 'xl'];

    return (
      <div class="flex gap-4">
        {sizes.map((size) => (
          <div class="flex flex-col items-center">
            <IconButton
              iconName="mapPin"
              iconSize={size}
              label={`${size} icon button`}
              onClick={() => console.log(`Clicked ${size} button`)}
            />
            <span class="text-sm text-gray-500 mt-2">{size}</span>
          </div>
        ))}
      </div>
    );
  }
};

export const States: IconButtonStory = {
  // @ts-ignore
  render: (args) => {
    return (
      <div class="flex gap-4">
        <div class="flex flex-col items-center">
          <IconButton
            iconName="check"
            label="Normal button"
            onClick={() => console.log('Clicked normal button')}
            iconSize="sm"
          />
          <span class="text-sm text-gray-500 mt-2">Normal</span>
        </div>

        <div class="flex flex-col items-center">
          <IconButton
            iconName="xMark"
            label="Disabled button"
            onClick={() => console.log('Clicked disabled button')}
            disabled={true}
            iconSize="sm"
          />
          <span class="text-sm text-gray-500 mt-2">Disabled</span>
        </div>

        <div class="flex flex-col items-center">
          <IconButton
            iconName="plus"
            label="Loading button"
            onClick={() => console.log('Clicked loading button')}
            loading={true}
            iconSize="sm"
          />
          <span class="text-sm text-gray-500 mt-2">Loading</span>
        </div>
      </div>
    );
  }
};
