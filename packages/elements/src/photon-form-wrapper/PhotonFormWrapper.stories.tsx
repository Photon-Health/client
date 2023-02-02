import PhotonFormWrapper, { PhotonFormWrapperProps } from '.';
import '@shoelace-style/shoelace/dist/components/button/button';

export default {
  title: 'photon-form-wrapper',
  component: PhotonFormWrapper,
};

const Template = ({
  title,
  titleIconName,
  headerRight,
  form,
  onClosed,
}: PhotonFormWrapperProps) => {
  return (
    <div class="w-full relative">
      <PhotonFormWrapper
        title={title}
        titleIconName={titleIconName}
        headerRight={headerRight}
        form={form}
        onClosed={onClosed}
      />
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  title: 'Prescription Flow',
  titleIconName: 'prescription',
  headerRight: (
    <div class="flex space-x-2">
      <photon-button>This Button</photon-button>
      <photon-button variant="outline">That Button</photon-button>
    </div>
  ),
  form: <form>Form</form>,
  onClosed: () => {
    console.log('closed');
  },
};
