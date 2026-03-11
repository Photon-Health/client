import { For, JSX } from 'solid-js';
import Select from '../Select';

export const LANGUAGE_OPTIONS = [
  { value: 'en', name: 'English' },
  { value: 'es', name: 'Spanish' },
  { value: 'zh', name: 'Chinese (Mandarin)' },
  { value: 'yue', name: 'Chinese (Cantonese)' },
  { value: 'tl', name: 'Tagalog' },
  { value: 'vi', name: 'Vietnamese' },
  { value: 'ar', name: 'Arabic' },
  { value: 'fr', name: 'French' },
  { value: 'ko', name: 'Korean' },
  { value: 'ru', name: 'Russian' },
  { value: 'de', name: 'German' },
  { value: 'ht', name: 'Haitian Creole' },
  { value: 'hi', name: 'Hindi' },
  { value: 'pt', name: 'Portuguese' },
  { value: 'it', name: 'Italian' },
  { value: 'pl', name: 'Polish' },
  { value: 'ur', name: 'Urdu' },
  { value: 'ja', name: 'Japanese' },
  { value: 'fa', name: 'Persian (Farsi)' },
  { value: 'gu', name: 'Gujarati' },
  { value: 'te', name: 'Telugu' },
  { value: 'pa', name: 'Punjabi' },
  { value: 'bn', name: 'Bengali' },
  { value: 'ta', name: 'Tamil' },
  { value: 'el', name: 'Greek' },
  { value: 'uk', name: 'Ukrainian' },
  { value: 'ro', name: 'Romanian' },
  { value: 'nl', name: 'Dutch' },
  { value: 'hmn', name: 'Hmong' },
  { value: 'sw', name: 'Swahili' },
  { value: 'am', name: 'Amharic' },
  { value: 'so', name: 'Somali' },
  { value: 'yi', name: 'Yiddish' },
  { value: 'my', name: 'Burmese' },
  { value: 'km', name: 'Khmer' },
  { value: 'lo', name: 'Lao' },
  { value: 'th', name: 'Thai' },
  { value: 'id', name: 'Indonesian' },
  { value: 'ms', name: 'Malay' },
  { value: 'hr', name: 'Croatian' },
  { value: 'sr', name: 'Serbian' },
  { value: 'cs', name: 'Czech' },
  { value: 'hu', name: 'Hungarian' },
  { value: 'tr', name: 'Turkish' },
  { value: 'he', name: 'Hebrew' },
  { value: 'ml', name: 'Malayalam' },
  { value: 'kn', name: 'Kannada' },
  { value: 'mr', name: 'Marathi' },
  { value: 'ne', name: 'Nepali' },
  { value: 'hat', name: 'Hausa' }
];

export interface LanguageSelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, FocusEvent>;
}

export default function LanguageSelect(props: LanguageSelectProps) {
  return (
    <Select
      value={props.value ?? 'en'}
      required={props.required}
      disabled={props.disabled}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      <For each={LANGUAGE_OPTIONS}>
        {(opt) => (
          <option value={opt.value} selected={(props.value ?? 'en') === opt.value}>
            {opt.name}
          </option>
        )}
      </For>
    </Select>
  );
}
