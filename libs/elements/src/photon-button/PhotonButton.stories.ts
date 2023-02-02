import { Story, Meta } from '@storybook/html';
import '.';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'photon-button',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['solid', 'outline'],
    },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
} as Meta;

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template: Story = ({ variant, disabled, size, label }) => {
  const div = document.createElement('div');
  div.innerHTML = `<photon-button variant="${variant}" disabled=${disabled} size="${size}">${label}</photon-button>`;

  return div;
};

export const Solid = Template.bind({});
// More on args: https://storybook.js.org/docs/html/writing-stories/args
Solid.args = {
  variant: 'solid',
  label: 'Button',
  disabled: false,
  size: 'md',
};

export const Outline = Template.bind({});
Outline.args = {
  variant: 'outline',
  label: 'Button',
  disabled: false,
  size: 'md',
};
