import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, For, createMemo, createSignal } from 'solid-js';
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
    const [query, setQuery] = createSignal('');
    const filteredPeople = createMemo(() => {
      return query() === ''
        ? randomNames
        : randomNames.filter((person) => {
            return person.name.toLowerCase().includes(query().toLowerCase());
          });
    });

    return (
      <ComboBox>
        <ComboBox.Input
          onInput={(e) => setQuery(e.currentTarget.value)}
          displayValue={(person) => person.name}
        />
        <ComboBox.Options>
          <For each={filteredPeople()}>
            {(person) => (
              <ComboBox.Option key={person.id} value={person}>
                {person.name}
              </ComboBox.Option>
            )}
          </For>
        </ComboBox.Options>
      </ComboBox>
    );
  }
};
