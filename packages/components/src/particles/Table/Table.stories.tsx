import Table, { TableProps } from '.';
import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';

type TableStory = StoryObj<TableProps>;

const people = [
  {
    name: 'Lindsay Walton',
    title: 'Front-end Developer',
    email: 'lindsay.walton@example.com',
    role: 'Member'
  },
  {
    name: 'Courtney Henry',
    title: 'Designer',
    email: 'aoeu.aoeu@aoeu',
    role: 'Admin'
  },
  {
    name: 'Tom Cook',
    title: 'Director, Product Development',
    email: 'aoeueau@aoeu.aoe  ',
    role: 'Admin'
  },
  {
    name: 'Glenna Reichert',
    title: 'Customer Support',
    email: 'Glenna@support.com',
    role: 'Member'
  }
];

export const Default: TableStory = {
  args: {
    headers: ['Name', 'Title', 'Email', 'Role'],
    rows: people.map((person) =>
      Object.values(person).map((value, idx) => (
        <div class={idx === 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}>{value}</div>
      ))
    )
  }
};

export default {
  title: 'Table',
  tags: ['autodocs'],
  argTypes: {
    name: {
      defaultValue: 'DefaultName',
      control: {
        type: 'text'
      }
    }
  },
  render: (props) => {
    return (
      <div>
        <Table {...props} />
      </div>
    );
  }
} as Meta<ComponentProps<typeof Table>>;
