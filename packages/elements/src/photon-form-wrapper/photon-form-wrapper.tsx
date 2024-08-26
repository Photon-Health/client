import { createSignal, JSX, mergeProps, Show } from 'solid-js';
import { Button, Icon } from '@photonhealth/components';
import tailwind from '../tailwind.css?inline';

export type PhotonFormWrapperProps = {
  closeTitle?: string;
  closeBody?: string;
  headerRight?: JSX.Element;
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
    <div ref={ref} class="fixed top-0 left-0 w-full h-screen z-10 overflow-y-scroll bg-[#F9FAFB]">
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
      <header class="flex items-center px-4 py-2 md:px-8 md:py-3 bg-white fixed w-full z-10 shadow-card">
        <div class="flex items-center md:flex-1">
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
          {/* Left-Justified header on small screens */}
          <div class="flex items-center space-x-2 ml-2 md:hidden">
            <Show when={props.titleIconName}>
              <sl-icon name={props.titleIconName} />
            </Show>
            <p class="font-sans text-sm md:text-xl font-medium">{props.title}</p>
          </div>
        </div>
        {/* Centered header on larger screens */}
        <div class="hidden md:flex flex-1 justify-center items-center">
          <div class="flex items-center space-x-2">
            <Show when={props.titleIconName}>
              <sl-icon name={props.titleIconName} />
            </Show>
            <p class="font-sans text-xl font-medium">{props.title}</p>
          </div>
        </div>
        <div class="flex-1 flex justify-end">
          <Show when={props.headerRight}>
            <div class="flex justify-end">{props.headerRight}</div>
          </Show>
        </div>
      </header>
      <div class="overflow-y-scroll w-full min-h-screen bg-[#F9FAFB] pt-28 xs:pt-28 lg:pt-20">
        <div class="px-4 pb-24 md:pt-4 md:pb-52 md:px-4 w-full h-full sm:w-[600px] xs:mx-auto">
          {props.form}
        </div>
      </div>
    </div>
  );
};
