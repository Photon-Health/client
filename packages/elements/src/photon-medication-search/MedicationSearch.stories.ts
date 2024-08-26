import { Story, Meta } from '@storybook/html';
import '../photon-client';
import '.';

export default {
  title: 'photon-medication-search',
  argTypes: {
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    helpText: { control: 'text' },
    catalogId: { control: 'text' },
    disabled: { control: 'boolean' },
    formName: { control: 'text' }
  }
} as Meta;

const Template: Story = ({
  label = undefined,
  required = false,
  invalid = false,
  helpText = undefined,
  catalogId = undefined,
  disabled = false,
  formName = undefined
}) => {
  const div = document.createElement('div');
  div.innerHTML = `
    <div style="width:800px;">
      <photon-client
        id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
        org="org_KzSVZBQixLRkqj5d"
        domain="auth.boson.health"
        audience="https://api.boson.health"
        uri="https://api.boson.health/graphql"
      >
        <photon-medication-search
          label="${label}" 
          required=${required} 
          invalid=${invalid} 
          help-text="${helpText}" 
          catalog-id="${catalogId}" 
          disabled=${disabled} 
          form-name="${formName}" 
        ></photon-medication-search>
      </photon-client>
    </div>
  `;

  return div;
};

export const MedicationSearch = Template.bind({});
MedicationSearch.args = {
  label: 'Treatment',
  required: 'true',
  invalid: 'false',
  helpText: 'Select your medication in this dropdown',
  catalogId: '12345',
  disabled: 'false',
  formName: 'form1'
};
