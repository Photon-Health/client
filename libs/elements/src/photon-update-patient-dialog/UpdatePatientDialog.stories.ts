import { Story, Meta } from '@storybook/html';
import '../photon-client';
import '.';

// TODO: render in place

export default {
  title: 'photon-update-patient-dialog',
  argTypes: {},
} as Meta;

const Template: Story = ({ open }) => {
  const div = document.createElement('div');
  div.innerHTML = `
    <photon-client
      id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
      org="org_KzSVZBQixLRkqj5d"
      domain="auth.boson.health"
      audience="https://api.boson.health"
      uri="https://api.boson.health/graphql"
      auto-login="true"
    >
      <div style="position:relative;">
        <photon-update-patient-dialog open=${open} patient-id="pat_01GPE8Z1TATPCMV35V87EM1KEQ"></photon-update-patient-dialog>
      </div>
    </photon-client>
  `;

  return div;
};

export const UpdatePatientDialog = Template.bind({});
UpdatePatientDialog.args = {
  open: true,
};
