import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, For } from 'solid-js';
import { FlyoutMenu } from './';
import Table from '../Table';

type FlyoutMenuStory = StoryObj<ComponentProps<typeof FlyoutMenu>>;

const meta: Meta<ComponentProps<typeof FlyoutMenu>> = {
  title: 'FlyoutMenu',
  // @ts-ignore
  component: FlyoutMenu,
  argTypes: {},
  tags: ['autodocs']
};

export default meta;

export const Default: FlyoutMenuStory = {
  args: {
    options: [
      { label: 'anchor 1', icon: 'inbox', link: '/' },
      { label: 'button 1', onClick: () => alert('Hello from button 1') }
    ]
  }
};

export const WithinTable: FlyoutMenuStory = {
  args: {
    options: [
      { label: 'anchor 1', icon: 'cog', link: '/' },
      { label: 'button 1', onClick: () => alert('Hello from button 1') }
    ]
  },
  // @ts-ignore
  render: (args) => {
    return (
      <div>
        <Table>
          <Table.Header>
            <Table.Col>Header 1</Table.Col>
            <Table.Col>Header 2</Table.Col>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Row 1 Cell 1</Table.Cell>
              <Table.Cell>
                <FlyoutMenu options={args.options} />
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Row 2 Cell 1</Table.Cell>
              <Table.Cell>
                <FlyoutMenu options={args.options} />
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }
};
