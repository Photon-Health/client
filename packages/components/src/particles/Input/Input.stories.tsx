import Input, { InputProps } from '.';

import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';

type InputStory = StoryObj<InputProps>;

export const Default: InputStory = {
  args: {
    type: 'text',
    placeholder: 'like@this.com',
    error: false
  }
};

export const InputOptions: InputStory = {
  // @ts-ignore
  render: () => {
    return (
      <>
        <Input type="text" placeholder="text" />
        <Input type="email" placeholder="email" />
      </>
    );
  }
};

export default {
  title: 'Input',
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['text', 'number', 'email', 'password'],
      defaultValue: 'text',
      control: {
        type: 'select'
      }
    },
    placeholder: {
      defaultValue: 'like@this.com',
      control: {
        type: 'text'
      }
    },
    error: {
      defaultValue: false,
      control: {
        type: 'boolean'
      }
    }
  },
  render: (props) => {
    return (
      <div>
        <Input {...props} />
      </div>
    );
  }
} as Meta<ComponentProps<typeof Input>>;
