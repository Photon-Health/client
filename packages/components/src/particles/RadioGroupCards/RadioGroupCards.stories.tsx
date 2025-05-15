import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps } from 'solid-js';
import RadioGroupCards, { RadioGroupCardsProps } from '.';

type RadioGroupCardsStory = StoryObj<RadioGroupCardsProps>;

const meta: Meta<ComponentProps<typeof RadioGroupCards>> = {
  title: 'RadioGroupCards',
  // @ts-ignore
  component: RadioGroupCards,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: RadioGroupCardsStory = {
  // @ts-ignore
  render: () => {
    const pharmacies = [
      { id: '1234', name: 'Walmart', address: '123 Main St', disabled: false },
      { id: '5678', name: 'Walgreens', address: '456 Main St', disabled: false },
      { id: '9012', name: 'CVS', address: '789 Main St', disabled: true }
    ];

    return (
      <div class="max-w-md">
        <RadioGroupCards label="Pharmacies" setSelected={(s) => console.log('selected: ', s)}>
          {pharmacies.map(({ id, name, address, disabled }) => (
            <RadioGroupCards.Option value={id} disabled={disabled}>
              <div>
                <div class="mr-4">{name}</div>
                <div class="text-sm text-slate-500">{address}</div>
              </div>
            </RadioGroupCards.Option>
          ))}
        </RadioGroupCards>
      </div>
    );
  }
};

export const Selected: RadioGroupCardsStory = {
  // @ts-ignore
  render: () => {
    const pharmacies = [
      { id: '1234', name: 'Walmart', address: '123 Main St', disabled: false },
      { id: '5678', name: 'Walgreens', address: '456 Main St', disabled: false },
      { id: '9012', name: 'CVS', address: '789 Main St', disabled: true }
    ];

    return (
      <div class="max-w-md">
        <RadioGroupCards
          label="Pharmacies"
          setSelected={(s) => console.log('selected: ', s)}
          initSelected={pharmacies[1].id}
        >
          {pharmacies.map(({ id, name, address, disabled }) => (
            <RadioGroupCards.Option value={id} disabled={disabled}>
              <div>
                <div class="mr-4">{name}</div>
                <div class="text-sm text-slate-500">{address}</div>
              </div>
            </RadioGroupCards.Option>
          ))}
        </RadioGroupCards>
      </div>
    );
  }
};
