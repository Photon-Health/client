import { Toaster } from 'solid-toast';

const Toast = (props: { buffer?: number }) => {
  return (
    <Toaster
      containerStyle={{
        'margin-top': `${props?.buffer || 0}px`
      }}
    />
  );
};

export default Toast;
