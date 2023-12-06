import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps } from 'solid-js';
import Textarea from './';

type TextareaStory = StoryObj;

const meta: Meta<ComponentProps<typeof Textarea>> = {
  title: 'Textarea',
  // @ts-ignore
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: TextareaStory = {
  // @ts-ignore
  render: () => {
    return (
      <div class="max-w-md flex flex-col items-start gap-8">
        <Textarea />
        <Textarea resize placeholder="Your deepest thoughts please... resize as needed" />
        <Textarea resize rows={8} placeholder="This starts with 8 rows" />
      </div>
    );
  }
};
