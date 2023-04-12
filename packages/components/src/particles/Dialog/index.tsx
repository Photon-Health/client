import { JSX, Show } from 'solid-js';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children?: JSX.Element;
}

function Dialog(props: DialogProps) {
  return (
    <Show when={props.open}>
      <div>{props.children}</div>;
    </Show>
  );
}

function DialogPanel(props: { children?: JSX.Element }) {
  return <div>{props.children}</div>;
}

function DialogTitle(props: { children?: JSX.Element }) {
  return <h2>{props.children}</h2>;
}

function DialogDescription(props: { children?: JSX.Element }) {
  return <p>{props.children}</p>;
}

Dialog.Panel = DialogPanel;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;

export default Dialog;
