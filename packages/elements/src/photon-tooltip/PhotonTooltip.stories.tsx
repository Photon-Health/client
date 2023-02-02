import PhotonTooltip, { PhotonTooltipProps } from '.';

export default {
  title: 'photon-tooltip',
  component: PhotonTooltip,
  argTypes: {
    tip: {
      control: {
        type: 'text',
      },
    },
    placement: {
      control: {
        type: 'select',
        options: [
          'top',
          'top-start',
          'top-end',
          'right',
          'right-start',
          'right-end',
          'bottom',
          'bottom-start',
          'bottom-end',
          'left',
          'left-start',
          'left-end',
        ],
      },
    },
  },
};

const Template = ({ tip, placement }: PhotonTooltipProps) => {
  return (
    <div style={{ padding: '50px' }}>
      <PhotonTooltip tip={tip} placement={placement} />
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  tip: 'Yo, wots up?',
  placement: 'right',
};

export const LongText = Template.bind({});
LongText.args = {
  tip: 'This prescription will be filled generically unless this box is checked',
  placement: 'right',
};
