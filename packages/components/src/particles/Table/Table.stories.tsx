import Table, { TableProps } from '.';
import type { Meta, StoryObj } from '@storybook/html';
import { For, type ComponentProps } from 'solid-js';

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

const headers = Object.keys(people[0]);
const rows = people.map((person) =>
  Object.values(person).map((value, idx) => (
    <div class={idx === 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}>{value}</div>
  ))
);

export const Default: TableStory = {
  args: {}
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
    // make header text have uppercase first letter
    return (
      <Table>
        <Table.Header>
          <For each={headers}>
            {(header) => <Table.Col>{header[0].toUpperCase() + header.slice(1)}</Table.Col>}
          </For>
        </Table.Header>
        <Table.Body>
          <For each={rows}>
            {(row) => (
              <Table.Row>
                <For each={row}>{(cell) => <Table.Cell>{cell}</Table.Cell>}</For>
              </Table.Row>
            )}
          </For>
        </Table.Body>
      </Table>
    );
  }
} as Meta<ComponentProps<typeof Table>>;
