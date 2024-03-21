import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps } from 'solid-js';
import { Alert } from './';

type AlertStory = StoryObj<ComponentProps<typeof Alert>>;

const meta: Meta<ComponentProps<typeof Alert>> = {
  title: 'Alert',
  // @ts-ignore
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error']
    },
    header: {
      control: 'text'
    },
    message: {
      control: 'text'
    }
  }
};

export default meta;

export const Default: AlertStory = {
  args: {
    type: 'warning',
    header: 'Warning',
    message: 'This is a warning alert.'
  }
};

export const Success: AlertStory = {
  args: {
    type: 'success',
    header: 'Success',
    message: 'This is a success alert.'
  }
};

export const Info: AlertStory = {
  args: {
    type: 'info',
    header: 'Info',
    message: 'This is an info alert.'
  }
};

export const Error: AlertStory = {
  args: {
    type: 'error',
    header: 'Error',
    message: 'This is an error alert.'
  }
};
