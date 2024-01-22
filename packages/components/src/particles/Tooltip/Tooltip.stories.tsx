import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, For } from 'solid-js';
import Text from '../Text';
import Tooltip, { TooltipProps } from './';

type TooltipStory = StoryObj<TooltipProps>;

const meta: Meta<ComponentProps<typeof Tooltip>> = {
  title: 'Tooltip',
  // @ts-ignore
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: TooltipStory = {
  // @ts-ignore
  render: () => {
    return (
      <div class="max-w-md flex flex-col items-start gap-y-10">
        <Tooltip text="Here is a tip">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md">Hover me</button>
        </Tooltip>
        <Tooltip text="This is a much longer tip">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md">Hover me</button>
        </Tooltip>
        <div class="flex">
          Hover on this regulur text in parethsesis {'=> '}
          <span>
            <Tooltip text="Not much.">(sup)</Tooltip>
          </span>
        </div>
      </div>
    );
  }
};
