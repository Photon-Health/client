import Card, { CardProps } from '../Card';
import { For } from 'solid-js/web';
import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import Button from '../Button';

type Story = StoryObj<CardProps>;

export const Default: Story = {
  args: {
    children: <div>This is a simple card.</div>
  }
};

export const CardGrid: Story = {
  // @ts-ignore
  render: () => {
    const cardsContent = ['This is card 1.', 'This is card 2 and selected.', 'This is card 3.'];

    return (
      <div class="grid grid-cols-3 gap-4">
        <For each={cardsContent}>{(content, i) => <Card selected={i() === 1}>{content}</Card>}</For>
      </div>
    );
  }
};

export const CardWithSections: Story = {
  // @ts-ignore
  render: () => (
    <div class="max-w-lg">
      <Card>
        <h3 class="text-xl leading-6 font-medium text-gray-900">Food Fermentation</h3>
        <p>
          Food fermentation is a complex biochemical process that leverages the metabolic activities
          of various microorganisms, primarily bacteria and yeasts, to convert substrates like
          carbohydrates into by-products such as alcohols, gases, or organic acids. This process
          results in an anaerobic conversion, enhancing the organoleptic properties of food and
          inhibiting pathogenic microbial growth, thereby augmenting the shelf life of food.
          Detailed understanding of the fermentation process, its modulation, and the specific
          microbiome involved in different food systems are critical for the development and
          optimization of fermented food products with improved sensory and nutritional attributes.
        </p>
        <div class="flex justify-end gap-x-4">
          <Button>Subscribe</Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </Card>
    </div>
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
