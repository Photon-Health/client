import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, createSignal } from 'solid-js';
import InputGroup, { InputGroupProps } from '.';
import ComboBox from '../ComboBox';
import Input from '../Input';

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
  render: () => (
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
      <InputGroup label="Disabled Input">
        <Input placeholder="you@example.com" value="example@example.com" disabled />
      </InputGroup>
      <InputGroup label="Select Name">
        <ComboBox />
      </InputGroup>
    </div>
  )
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
