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

export default {
  title: 'InputGroup',
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
  },
  render: (props) => {
    return (
      <div>
        <InputGroup {...props} />
      </div>
    );
  }
} as Meta<ComponentProps<typeof InputGroup>>;
