import Card, { CardProps } from '../Card';
import { For } from 'solid-js/web';
import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';

type Story = StoryObj<CardProps>;

export const Default: Story = {
  args: {
    children: <p>This is a simple card.</p>
  }
};

export const CardGrid: Story = {
  // @ts-ignore
  render: () => {
    const cardsContent = ['This is card 1.', 'This is card 2.', 'This is card 3.'];

    return (
      <div class="grid grid-cols-3 gap-4">
        <For each={cardsContent}>{(content) => <Card>{content}</Card>}</For>
      </div>
    );
  }
};

export const CardWithHeader: Story = {
  // @ts-ignore
  render: () => (
    <Card>
      <h2 class="text-xl leading-6 font-medium text-gray-900">Card Title</h2>
      <p>This is a card with a header.</p>
    </Card>
  )
};

export default {
  title: 'Card',
  tags: ['autodocs'],
  argTypes: {},
  render: (props) => {
    return (
      <div>
        <Card {...props} />
      </div>
    );
  }
} as Meta<ComponentProps<typeof Card>>;
