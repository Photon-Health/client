import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import ComboBox, { ComboBoxProps } from '.';

type InputGroupStory = StoryObj<ComboBoxProps>;

export const Default: InputGroupStory = {
  args: {}
};

const meta: Meta<ComponentProps<typeof ComboBox>> = {
  title: 'ComboBox',
  // @ts-ignore
  component: ComboBox,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
