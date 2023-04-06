import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, For, createSignal } from 'solid-js';
import ComboBox, { ComboBoxProps } from '.';
import { randomNames } from '../../sampleData/randomNames';

type InputGroupStory = StoryObj<ComboBoxProps>;

const meta: Meta<ComponentProps<typeof ComboBox>> = {
  title: 'ComboBox',
  // @ts-ignore
  component: ComboBox,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: InputGroupStory = {
  // @ts-ignore
  render: (args) => {
    const [people] = createSignal(randomNames);

    return (
      <ComboBox {...args}>
        <For each={people()}>{(person) => <ComboBox.Option>{person}</ComboBox.Option>}</For>
      </ComboBox>
    );
  }
};
