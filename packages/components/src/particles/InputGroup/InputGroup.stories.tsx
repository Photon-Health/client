import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import InputGroup, { InputGroupProps } from '.';
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
      <InputGroup.Input type="email" placeholder="you@example.com" />
    </InputGroup>
  )
};

export const MultipleInputs: InputGroupStory = {
  // @ts-ignore
  render: () => (
    <div class="grid grid-cols-2 gap-4">
      <div>
        <InputGroup label="Invalid Email" error="Not a valid email address.">
          <InputGroup.Input type="email" placeholder="you@example.com" />
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
