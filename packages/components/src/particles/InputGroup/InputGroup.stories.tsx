import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import InputGroup, { InputGroupProps } from '.';

type InputGroupStory = StoryObj<InputGroupProps>;

export const Default: InputGroupStory = {
  args: {
    label: 'Email',
    error: '',
    helpText: "We'll only use this for spam."
  }
};

export const MultipleInputs: InputGroupStory = {
  // @ts-ignore
  render: () => (
    <div class="grid grid-cols-2 gap-4">
      <div>
        <InputGroup
          label="Email"
          helpText="We'll only use this for spam."
          inputProps={{ placeholder: 'you@example.com' }}
        />
      </div>
      <div>
        <InputGroup label="Quantity" inputType="number" />
      </div>
      <div>
        <InputGroup
          label="Invalid Email"
          error="Not a valid email address."
          inputProps={{ placeholder: 'you@example.com' }}
        />
      </div>
      <div>
        <InputGroup
          label="Default Value"
          inputProps={{ placeholder: 'you@example.com', value: 'example@example.com' }}
        />
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
