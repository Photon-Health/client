import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, For, createSignal, createMemo } from 'solid-js';
import InputGroup, { InputGroupProps } from '.';
import ComboBox from '../ComboBox';
import Input from '../Input';
import { randomNames } from '../../sampleData/randomNames';
import Badge from '../Badge';

type InputGroupStory = StoryObj<InputGroupProps>;

export const Default: InputGroupStory = {
  args: {
    label: 'Email',
    error: '',
    helpText: "We'll only use this for spam."
  },
  // @ts-ignore
  render: (props) => (
    <InputGroup {...props}>
      <Input type="email" placeholder="you@example.com" />
    </InputGroup>
  )
};

export const MultipleInputs: InputGroupStory = {
  // @ts-ignore
  render: () => {
    const [value, setValue] = createSignal(false);
    const [query, setQuery] = createSignal('');
    const filteredPeople = createMemo(() => {
      return query() === ''
        ? randomNames
        : randomNames.filter((person) => {
            return person.name.toLowerCase().includes(query().toLowerCase());
          });
    });

    return (
      <div class="grid grid-cols-2 gap-4">
        <InputGroup label="Email" helpText="We'll only use this for spam.">
          <Input type="email" placeholder="you@example.com" />
        </InputGroup>

        <InputGroup label="Quantity" contextText="Optional">
          <Input type="number" />
        </InputGroup>

        <InputGroup label="Invalid Email" error="Not a valid email address.">
          <Input type="email" placeholder="you@example.com" />
        </InputGroup>

        <InputGroup
          label="Disabled Input"
          contextText={
            <Badge size="sm" color="yellow">
              Disabled
            </Badge>
          }
        >
          <Input placeholder="you@example.com" value="example@example.com" disabled />
        </InputGroup>

        <InputGroup label="Loading Input" loading>
          <Input placeholder="...fetching" />
        </InputGroup>

        <InputGroup label="Select Name" helpText="So many options">
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
        </InputGroup>

        <InputGroup label="Loading ComboBox" loading>
          <ComboBox>
            <ComboBox.Input displayValue={() => ''} placeholder="...fetching combo" />
          </ComboBox>
        </InputGroup>

        <InputGroup
          label="Interactive Input"
          helpText="Type 'yes' to see an error."
          contextText='Go ahead, try "yes"'
          error={value() ? 'Yes, there is an error.' : ''}
        >
          <Input
            type="type"
            placeholder="Are you going to type 'yes'?"
            onInput={(e) => {
              setValue(e.currentTarget.value === 'yes');
            }}
          />
        </InputGroup>

        <InputGroup label="Email with Sub-Label" subLabel="We'll only use this for spam.">
          <Input type="email" placeholder="you@example.com" />
        </InputGroup>
      </div>
    );
  }
};

const meta: Meta<ComponentProps<typeof InputGroup>> = {
  title: 'InputGroup',
  // @ts-ignore
  component: InputGroup,
  tags: ['autodocs'],
  argTypes: {
    label: {
      defaultValue: 'Email',
      control: {
        type: 'text'
      }
    },
    error: {
      defaultValue: '',
      control: {
        type: 'text'
      }
    },
    helpText: {
      defaultValue: "We'll only use this for spam.",
      control: {
        type: 'text'
      }
    }
  }
};

export default meta;
