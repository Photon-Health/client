import { JSX, Show, createContext, createEffect, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Transition } from 'solid-transition-group';
import Button from '../Button';
import createTransition from '../../utils/createTransition';

const transitionDuration = 100;

interface DialogState {
  open: boolean;
  onClose: () => void;
}

interface DialogActions {
  setOpen: (open: boolean) => void;
  setOnClose: (fn: () => void) => void;
}

type DialogContextValue = [DialogState, DialogActions];

export const DialogContext = createContext<DialogContextValue>([
  { open: false, onClose: () => {} },
  { setOpen: () => {}, setOnClose: () => {} }
]);

export function DialogProvider(props: { children?: JSX.Element }) {
  const [state, setState] = createStore<DialogState>({ open: false, onClose: () => {} });
  const dialog: DialogContextValue = [
    state,
    {
      setOpen(open: boolean) {
        setState('open', open);
      },
      setOnClose(fn: () => void) {
        setState('onClose', fn);
      }
    }
  ];

  return <DialogContext.Provider value={dialog}>{props.children}</DialogContext.Provider>;
}

export function useDialog() {
  return useContext(DialogContext);
}

function DialogPanel(props: { children?: JSX.Element }) {
  const [state] = useDialog();
  console.log('rendering panel', state);
  return (
    <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
      {props.children}
      <Button onClick={() => state.onClose()}>Close</Button>
    </div>
  );
}

function DialogTitle(props: { children?: JSX.Element }) {
  return <h2>{props.children}</h2>;
}

function DialogDescription(props: { children?: JSX.Element }) {
  return <p>{props.children}</p>;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children?: JSX.Element;
}

function DialogWrapper(props: DialogProps) {
  const [state, { setOnClose }] = useDialog();

  createEffect(() => {
    console.log('setting onclose', props.onClose);
    setOnClose(props.onClose);
  });

  return (
    <div class="relative z-10">
      <Transition
        onEnter={createTransition([{ opacity: 0 }, { opacity: 1 }], {
          duration: transitionDuration,
          easing: 'ease-in'
        })}
        onExit={createTransition([{ opacity: 1 }, { opacity: 0 }], {
          duration: transitionDuration,
          easing: 'ease-out'
        })}
      >
        <Show when={props.open}>
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Show>
      </Transition>
      <Transition
        onEnter={createTransition(
          [
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          {
            duration: transitionDuration,
            easing: 'ease-in'
          }
        )}
        onExit={createTransition(
          [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.95)' }
          ],
          {
            duration: transitionDuration,
            easing: 'ease-out'
          }
        )}
      >
        {props.open && (
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              {props.children}
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}

function Dialog(props: DialogProps) {
  return (
    <DialogProvider>
      <DialogWrapper {...props}>{props.children}</DialogWrapper>
    </DialogProvider>
  );
}

Dialog.Panel = DialogPanel;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;

export default Dialog;
