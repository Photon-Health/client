import { clsx } from 'clsx';
import { JSX, Show } from 'solid-js';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  required: boolean;
  optional: boolean;
}

export default function Input(props: InputProps) {
  const { children, type, error, ...inputProps } = props;

  return (
    <>
      <label for="email">Email</label>
      <input {...inputProps} classList={{ error: !!error }} />
      <Show when={!!error}>
        <p>{error}</p>
      </Show>
    </>
  );
}
