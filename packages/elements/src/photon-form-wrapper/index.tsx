import { createSignal, JSX, mergeProps, Show } from 'solid-js';
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

const PhotonFormWrapper = (p: PhotonFormWrapperProps) => {
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
      <header class="flex flex-col md:flex-row items-center px-4 py-2 md:px-8 md:py-3 bg-white fixed w-full z-10 shadow-card">
        <div class="flex justify-start md:flex-1 absolute md:static left-4">
          <photon-button
            class="close-button"
            size="small"
            circle
            on:click={() => {
              if (props.checkShouldWarn()) {
                onCloseDialogOpen(true);
              } else {
                props.onClosed();
              }
            }}
            variant="naked"
          >
            <div class="text-black text-xl md:text-3xl">
              <sl-icon style={{ display: 'block' }} name="x" />
            </div>
          </photon-button>
        </div>
        <div class="mb-2 md:mb-0 flex flex-0 md:flex-1 justify-center md:justify-center items-center">
          <Show when={props.titleIconName}>
            <sl-icon name={props.titleIconName} />
          </Show>
          <p class="ml-1 font-sans text-sm md:text-xl font-medium">{props.title}</p>
        </div>
        <div class="flex flex-col md:flex-row flex-1">
          <Show when={props.headerRight}>
            <div class="flex-1 flex justify-end">{props.headerRight}</div>
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

export default PhotonFormWrapper;
