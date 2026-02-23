import { JSX } from 'solid-js';
import Input from '../Input';

export interface DateInputProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onDateChange?: (value: string | undefined) => void;
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
  onComplete?: () => void;
}

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
      onChange={(e: Event & { currentTarget: HTMLInputElement }) => {
        if (
          (e.currentTarget as HTMLInputElement).value &&
          window.matchMedia('(pointer: coarse)').matches
        ) {
          props.onComplete?.();
        }
      }}
      onPaste={(e: ClipboardEvent & { currentTarget: HTMLInputElement }) => {
        const pasteText = e.clipboardData?.getData('Text');
        if (!pasteText) return;
        const formatted = formatDate(pasteText);
        if (formatted) {
          e.preventDefault();
          props.onDateChange?.(formatted);
        }
      }}
      onBlur={props.onBlur}
    />
  );
}

function formatDate(dateString: string): string {
  const dateParts = dateString.split(/[/\s-]/);
  if (dateParts.length !== 3) return '';
  const [month, day, year] = dateParts.map((part) => parseInt(part));
  if (isNaN(month) || isNaN(day) || isNaN(year)) return '';
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}
