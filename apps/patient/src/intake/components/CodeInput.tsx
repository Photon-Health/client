import { ClipboardEvent, KeyboardEvent, useRef } from 'react';

export const CODE_LENGTH = 6;

const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const CodeInput = ({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (index: number) => refs.current[index]?.focus();

  const setDigit = (index: number, raw: string) => {
    const digits = digitsOnly(raw);
    if (!digits) return;

    // Typing over a filled box, or pasting into one, fills forward from here.
    const next = (value.slice(0, index) + digits).slice(0, CODE_LENGTH).padEnd(value.length, '');
    onChange(next.slice(0, CODE_LENGTH));
    focus(Math.min(index + digits.length, CODE_LENGTH - 1));
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (value[index]) {
        onChange(value.slice(0, index));
        return;
      }
      onChange(value.slice(0, Math.max(index - 1, 0)));
      focus(Math.max(index - 1, 0));
    }
    if (event.key === 'ArrowLeft') focus(Math.max(index - 1, 0));
    if (event.key === 'ArrowRight') focus(Math.min(index + 1, CODE_LENGTH - 1));
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = digitsOnly(event.clipboardData.getData('text')).slice(0, CODE_LENGTH);
    onChange(digits);
    focus(Math.min(digits.length, CODE_LENGTH - 1));
  };

  return (
    <div className="intake__code">
      {Array.from({ length: CODE_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          className="intake__code-box type-app-heading-l"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          value={value[index] ?? ''}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={onKeyDown(index)}
          onPaste={onPaste}
        />
      ))}
    </div>
  );
};
