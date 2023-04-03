import { createSignal } from 'solid-js';
import Input, { InputProps } from '../Input';

export interface InputGroupProps {
  label: string;
  error?: string;
  helpText?: string;
  inputType?: string;
  inputProps?: Omit<InputProps, 'id'>;
}

export default function InputGroup(props: InputGroupProps) {
  const { label, error, helpText, inputType, inputProps } = props;
  const [forId] = createSignal(`input-${Math.random().toString(36).slice(2, 11)}`);
  const ariaDescribedBy = error ? `${forId()}-error` : helpText ? `${forId()}-help` : undefined;

  return (
    <>
      <label class="block text-sm font-medium leading-6 text-gray-900 mb-1" for={forId()}>
        {label}
      </label>
      <Input
        id={forId()}
        type={inputType || 'text'}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        {...inputProps}
        error={!!error}
      />
      <div class="h-6">
        <p class={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`} id={ariaDescribedBy}>
          {error || helpText}
        </p>
      </div>
    </>
  );
}
