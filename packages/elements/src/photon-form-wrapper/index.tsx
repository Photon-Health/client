import { createSignal, JSX, Show } from 'solid-js';
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

const PhotonFormWrapper = ({
  closeTitle = 'Lose unsaved changes?',
  closeBody = 'You will not be able to recover unsaved changes.',
  headerRight,
  title,
  titleIconName,
  form,
  onClosed,
  checkShouldWarn = () => false
}: PhotonFormWrapperProps) => {
  let ref: any;
  const [closeDialogOpen, setCloseDialogOpen] = createSignal<boolean>(false);

  return (
    <div ref={ref} class="absolute top-0 left-0 w-full z-10">
      <style>{tailwind}</style>

      {/* Close Wrapper Modal */}
      <photon-dialog
        label={closeTitle}
        open={closeDialogOpen()}
        confirm-text="Yes, Close"
        cancel-text="Keep Editing"
        on:photon-dialog-confirmed={() => {
          setCloseDialogOpen(false);
          onClosed();
        }}
        on:photon-dialog-canceled={() => {
          setCloseDialogOpen(false);
        }}
      >
        <p class="font-sans text-lg xs:text-base">{closeBody}</p>
      </photon-dialog>

      {/* Wrapper */}
      <div class="flex items-center px-4 py-2 md:px-8 md:py-3 bg-white fixed w-full z-10 shadow-card">
        <div class="md:w-2/5 flex justify-start">
          <photon-button
            class="close-button"
            size="small"
            circle
            on:click={() => {
              if (checkShouldWarn()) {
                setCloseDialogOpen(true);
              } else {
                onClosed();
              }
            }}
            variant="naked"
          >
            <div class="text-black text-3xl">
              <sl-icon style={{ display: 'block' }} name="x" />
            </div>
          </photon-button>
        </div>
        <div class="w-full md:w-3/5 flex flex-col md:flex-row">
          <div class="mb-2 md:mb-0 flex justify-end md:justify-center items-center">
            <Show when={titleIconName}>
              <sl-icon name={titleIconName} />
            </Show>
            <p class="ml-1 font-sans text-xl font-medium">{title}</p>
          </div>
          <Show when={headerRight}>
            <div class="flex-1 flex justify-end">{headerRight}</div>
          </Show>
        </div>
      </div>
      <div class="w-full h-full bg-[#f7f4f4] pt-28 xs:pt-28 lg:pt-20">
        <div class="pt-4 pb-52 px-4 w-full h-full sm:w-[600px] xs:mx-auto">{form}</div>
      </div>
    </div>
  );
};

export default PhotonFormWrapper;
