import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps } from 'solid-js';
import RadioGroup, { RadioGroupProps } from './';

type RadioGroupStory = StoryObj<RadioGroupProps<string>>;

const meta: Meta<ComponentProps<typeof RadioGroup>> = {
  title: 'RadioGroup',
  // @ts-ignore
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: RadioGroupStory = {
  // @ts-ignore
  render: () => {
    return (
      <div class="max-w-md flex flex-col items-start gap-y-10">
        <RadioGroup set={['first', 'second', 'third']} legend="Select an option" />
      </div>
    );
  }
};
