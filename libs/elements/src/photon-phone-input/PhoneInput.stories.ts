import { Story, Meta } from '@storybook/html';
import '../photon-client';
import '.';
import type { PhoneInputProps } from '.';

export default {
  title: 'photon-phone-input',
} as Meta;

const Template: Story<PhoneInputProps> = ({ label, required, invalid, helpText, disabled }) => {
  const div = document.createElement('div');
  div.innerHTML = `<photon-phone-input label=${label} required=${required} invalid=${invalid} help-text=${helpText} disabled=${disabled}></photon-phone-input>`;

  return div;
};

export const PhoneInput = Template.bind({});
PhoneInput.args = {
  label: 'Label',
  required: true,
  invalid: false,
  helpText: 'This field is required',
  disabled: false,
};
