import { ComboBox } from '../ComboBox';
import { For } from 'solid-js';
import InputGroup from '../InputGroup';
import { SexType } from '@photonhealth/sdk/dist/types';

export const SexTypes = [SexType.Male, SexType.Female, SexType.Unknown];
type SexOption = {
  value: string;
  label: SexType;
};

export const sexes: SexOption[] = [
  {
    value: '1',
    label: SexType.Male
  },
  {
    value: '2',
    label: SexType.Female
  },
  {
    value: '3',
    label: SexType.Unknown
  }
];

export const SexInput = (props: {
  label?: string;
  selected?: SexType;
  onSexChange: (selected: SexType) => void;
  required: boolean;
  value?: number;
  error?: string;
  helpText?: string;
  disabled: boolean;
}) => {
  // const [sex, setSex] = createSignal<SexType | undefined>();

  const handleSetSelected = (selected: SexType) => {
    props.onSexChange(selected);
  };

  return (
    <InputGroup label={props.label}>
      <ComboBox
        // required={props.required}
        // displayAccessor={(p) => p?.name || ''}
        // helpText={props.helpText}
        setSelected={handleSetSelected}
        // selectedData={sexes.filter((x) => x.name.toUpperCase() === props.selected)?.[0]}
      >
        <ComboBox.Input
          displayValue={(option) => option.label}
          placeholder=""
          error={!!props.error}
          disabled={props.disabled}
          loading={false}
          // onInput={(e) => setSex(e.currentTarget.value)}
        />
        <ComboBox.Options>
          <For each={sexes}>
            {(option) => (
              <ComboBox.Option key={option.value} value={option.label}>
                {option.label}
              </ComboBox.Option>
            )}
          </For>
        </ComboBox.Options>
      </ComboBox>
    </InputGroup>
  );
};
