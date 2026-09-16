import { format, isValid, parse } from 'date-fns';
import { JSX } from 'solid-js';
import Input from '../Input';

export interface DateInputProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onDateChange?: (value: string | undefined) => void;
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
}

const DATE_FORMATS = [
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'M/d/yyyy',
  'M-d-yyyy',
  'M.d.yyyy',
  'd/M/yyyy',
  'd-M-yyyy',
  'd.M.yyyy',
  'MMM d, yyyy',
  'MMM d yyyy',
  'MMMM d, yyyy',
  'MMMM d yyyy'
];

export default function DateInput(props: DateInputProps) {
  return (
    <Input
      type="date"
      required={props.required}
      disabled={props.disabled}
      value={props.value}
      onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
        props.onDateChange?.(e.currentTarget.value || undefined);
      }}
      onPaste={(e: ClipboardEvent & { currentTarget: HTMLInputElement }) => {
        const pastedValue = e.clipboardData?.getData('Text');
        if (!pastedValue) return;

        const formatted = formatPastedDate(pastedValue);
        if (!formatted) return;

        e.preventDefault();
        props.onDateChange?.(formatted);
      }}
      onBlur={props.onBlur}
    />
  );
}

function formatPastedDate(value: string): string | undefined {
  const trimmedValue = value.trim();

  for (const dateFormat of DATE_FORMATS) {
    const date = parse(trimmedValue, dateFormat, new Date());
    if (isValid(date)) {
      return format(date, 'yyyy-MM-dd');
    }
  }

  return undefined;
}
