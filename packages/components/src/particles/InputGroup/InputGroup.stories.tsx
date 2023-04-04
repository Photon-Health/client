import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import InputGroup, { InputGroupProps } from '.';
import Input from '../Input';
import ComboBox from '../ComboBox';

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
      <Input type="email" placeholder="your@email.com" />
    </InputGroup>
  )
};

export const MultipleInputs: InputGroupStory = {
  // @ts-ignore
  render: () => (
    <div class="grid grid-cols-2 gap-4">
      <div>
        <InputGroup label="Email" helpText="We'll only use this for spam.">
          <Input type="email" placeholder="you@example.com" />
        </InputGroup>
      </div>
      <div>
        <InputGroup label="Quantity" contextText="Optional">
          <Input type="number" />
        </InputGroup>
      </div>
      <div>
        <InputGroup label="Invalid Email" error="Not a valid email address.">
          <Input type="email" placeholder="you@example.com" error />
        </InputGroup>
      </div>
      <div>
        <InputGroup label="Disabled Input">
          <Input placeholder="you@example.com" value="example@example.com" disabled />
        </InputGroup>
      </div>
      <div>
        <InputGroup label="Select Name">
          <ComboBox />
        </InputGroup>
      </div>
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
