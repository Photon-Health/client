import { For, Show, JSX } from 'solid-js';
import { Address, Pharmacy } from '@photonhealth/sdk/dist/types';
import InputGroup from '../../particles/InputGroup';
import ComboBox from '../../particles/ComboBox';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import Badge from '../../particles/Badge';

export type PharmacyOption = Pick<Pharmacy, 'id' | 'name'> & {
  address: Pick<Address, 'street1' | 'city' | 'state'>;
  isPreferred?: boolean;
  isPrevious?: boolean;
};

export interface PharmacySearchInputProps {
  value?: PharmacyOption;
  setValue: (val: PharmacyOption) => unknown;
  options?: PharmacyOption[];
  onSearch?: (val: string) => unknown;
  loading?: boolean;
  label?: JSX.Element;
  helpText?: JSX.Element;
}

const formattedAddress = (pharmacy: PharmacyOption) =>
  `${capitalizeFirstLetter(pharmacy.address?.street1 || '')}, ${capitalizeFirstLetter(
    pharmacy.address?.city || ''
  )}, ${pharmacy.address?.state}`;

export function PharmacySearchInput(props: PharmacySearchInputProps) {
  return (
    <InputGroup
      label={props.label}
      helpText={
        props.helpText ||
        ((props.value?.isPreferred || props.value?.isPrevious) && (
          <div class="flex gap-x-1">
            <Show when={props.value?.isPreferred}>
              <Badge size="sm" color="blue">
                Preferred
              </Badge>
            </Show>
            <Show when={!props.value?.isPreferred && props.value?.isPrevious}>
              <Badge size="sm" color="green">
                Previous
              </Badge>
            </Show>
          </div>
        ))
      }
      loading={props.loading}
    >
      <ComboBox<PharmacyOption>
        value={props.value}
        setSelected={(pharmacy) => pharmacy && props.setValue(pharmacy)}
      >
        <ComboBox.Input<PharmacyOption>
          onInput={(e) => props.onSearch?.(e.currentTarget.value)}
          displayValue={(pharmacy) => {
            return pharmacy?.name
              ? `${pharmacy.name}, ${capitalizeFirstLetter(pharmacy.address?.street1 || '')}`
              : '';
          }}
        />
        <ComboBox.Options>
          <Show when={(props.options?.length || 0) > 0}>
            <For each={props.options}>
              {(option) => {
                return (
                  <ComboBox.Option key={option.id} value={option}>
                    <div class="flex gap-x-1 items-center">
                      {option.name}{' '}
                      <Show when={option.isPreferred}>
                        <Badge size="sm" color="blue">
                          Preferred
                        </Badge>
                      </Show>
                      <Show when={!option.isPreferred && option.isPrevious}>
                        <Badge size="sm" color="green">
                          Previous
                        </Badge>
                      </Show>
                    </div>
                    <div class="text-xs">{formattedAddress(option)}</div>
                  </ComboBox.Option>
                );
              }}
            </For>
          </Show>
          <Show when={props.options?.length === 0}>
            <div class="p-4">No pharmacy matches that search</div>
          </Show>
        </ComboBox.Options>
      </ComboBox>
    </InputGroup>
  );
}
