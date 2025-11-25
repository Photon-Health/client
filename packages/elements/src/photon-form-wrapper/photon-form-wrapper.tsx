import { createSignal, JSX, mergeProps, Show } from 'solid-js';
import { Button, Icon } from '@photonhealth/components';
import tailwind from '../tailwind.css?inline';

export type PhotonFormWrapperProps = {
  closeTitle?: string;
  closeBody?: string;
  footer?: JSX.Element;
  title: string;
  titleIconName?: string;
  form?: JSX.Element;
  onClosed: () => void;
  checkShouldWarn?: () => boolean;
};

export const PhotonFormWrapper = (p: PhotonFormWrapperProps) => {
  const props = mergeProps(
    {
      closeTitle: 'Lose unsaved changes?',
      closeBody: 'You will not be able to recover unsaved changes.',
      checkShouldWarn: () => false
    },
    p
  );
  let ref: any;
  const [closeDialogOpen, onCloseDialogOpen] = createSignal<boolean>(false);

  const handleConfirm = () => {
    onCloseDialogOpen(false);
    props.onClosed();
  };
  const handleCancel = () => onCloseDialogOpen(false);

  return (
    <div ref={ref} class="z-50 fixed top-0 left-0 w-full h-screen overflow-y-scroll bg-[#F9FAFB]">
      <style>{tailwind}</style>

      {/* Close Wrapper Modal */}
      <photon-dialog
        label={props.closeTitle}
        open={closeDialogOpen()}
        confirm-text="Yes, Close"
        cancel-text="Keep Editing"
        on:photon-dialog-confirmed={handleConfirm}
        on:photon-dialog-canceled={handleCancel}
        on:photon-dialog-alt={handleCancel}
      >
        <p class="font-sans text-lg xs:text-base">{props.closeBody}</p>
      </photon-dialog>

      {/* Wrapper */}
      <header class="z-40 flex items-center px-4 py-2 md:px-8 md:py-3 bg-white fixed w-full shadow-card">
        <div class="flex justify-start">
          <Button
            variant="naked"
            size="sm"
            onClick={() => {
              if (props.checkShouldWarn()) {
                onCloseDialogOpen(true);
              } else {
                props.onClosed();
              }
            }}
          >
            <div class="text-black text-xl md:text-3xl">
              <Icon name="xMark" />
            </div>
          </Button>
        </div>
        <div class="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center">
          <Show when={props.titleIconName}>
            <sl-icon name={props.titleIconName} />
          </Show>
          <p class="ml-1 font-sans text-lg md:text-xl font-medium">{props.title}</p>
        </div>
      </header>
      <div class="z-30 w-full min-h-screen bg-[#F9FAFB] pt-14">
        <div class="px-4 pb-40 md:pt-4 md:pb-52 md:px-4 w-full h-full sm:w-[600px] xs:mx-auto">
          {props.form}
        </div>
      </div>
      <Show when={props.footer}>
        <footer class="z-40 fixed bottom-0 w-full bg-white shadow-card px-4 py-4 md:px-8">
          {props.footer}
        </footer>
      </Show>
    </div>
  );
};
