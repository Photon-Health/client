import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, createSignal } from 'solid-js';
import RadioGroup, { RadioGroupProps } from '.';

type RadioGroupStory = StoryObj<RadioGroupProps>;

const meta: Meta<ComponentProps<typeof RadioGroup>> = {
  title: 'RadioGroup',
  // @ts-ignore
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: RadioGroupStory = {
  // @ts-ignore
  render: () => {
    const pharmacies = [
      { id: '1234', name: 'Walmart', address: '123 Main St' },
      { id: '5678', name: 'Walgreens', address: '456 Main St' },
      { id: '9012', name: 'CVS', address: '789 Main St' }
    ];

    return (
      <div class="max-w-md">
        <RadioGroup label="Pharmacies">
          {pharmacies.map(({ id, name, address }) => (
            <RadioGroup.Option value={id}>
              <div>
                <div class="mr-4">{name}</div>
                <div class="text-sm text-slate-500">{address}</div>
              </div>
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>
    );
  }
};
