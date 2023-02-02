import { Show } from 'solid-js';
import { message } from '../../validators';
import { record, string, any } from 'superstruct';

const pharmacyValidator = message(
  record(string(), any()),
  'Please select or search for a pharmacy...'
);

export const OrderCard = (props: {
  store: Record<string, any>;
  actions: Record<string, Function>;
}) => {
  props.actions.registerValidator({
    key: 'pharmacy',
    validator: pharmacyValidator,
  });

  return (
    <photon-card>
      <div class="flex flex-col gap-3">
        <div class="flex flex-row">
          <p class="font-sans text-l font-medium flex-grow">Select Pharmacy</p>
        </div>
        <Show when={!props.store['patient']?.value}>
          <photon-card>
            <p class="italic font-sans text-gray-500">Please select a patient</p>
          </photon-card>
        </Show>
        <Show when={props.store['patient']?.value && !props.store['address']?.value}>
          <photon-card>
            <p class="italic font-sans text-gray-500">
              Please update patient address in order to select pharmacy
            </p>
          </photon-card>
        </Show>
        <Show when={props.store['patient']?.value && props.store['address']?.value}>
          <div class="flex flex-col gap-2">
            <p class="font-sans text-sm font-medium flex-grow">Search for a Local Pharmacy</p>
            <photon-pharmacy-search
              invalid={props.store['pharmacy']?.error ?? false}
              help-text={props.store['pharmacy']?.error}
              on:photon-pharmacy-selected={(e: any) => {
                props.actions.updateFormValue({
                  key: 'pharmacy',
                  value: e.detail.pharmacy,
                });
              }}
              on:photon-pharmacy-removed={(e: any) => {
                props.actions.updateFormValue({
                  key: 'pharmacy',
                  value: undefined,
                });
              }}
              address={
                props.store['patient']!.value.address
                  ? `${props.store['patient']!.value.address.street1} ${
                      props.store['patient']!.value.address.street2 || ''
                    } ${props.store['patient']!.value.address.city}, ${
                      props.store['patient']!.value.address.state
                    } ${props.store['patient']!.value.address.postalCode}`
                  : ''
              }
              selected={props.store['patient']!.value.preferredPharmacies?.[0]?.id ?? ''}
            ></photon-pharmacy-search>
          </div>
        </Show>
      </div>
    </photon-card>
  );
};
