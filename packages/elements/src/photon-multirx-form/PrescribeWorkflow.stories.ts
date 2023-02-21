import { Meta } from '@storybook/html';
import '../photon-client';
import '.';

export default {
  title: 'photon-multirx-form',
  argTypes: {}
} as Meta;

export const PrescribeWorkflow = () => {
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
        <photon-prescribe-workflow
          patient-id="pat_01G8VFW0X44YCW8KW7FW3FC0ZT"
          template-ids="tmp_01GHEYTMGWZZV3TDMYWR2ZW0ZB,tmp_01GHEYV0YCZVJW34253HKMY042"
        ></photon-prescribe-workflow>
      </photon-client>
    </div>
  `;

  return div;
};
