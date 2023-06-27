import { createEffect, createMemo, Show } from 'solid-js';
import { message } from '../../validators';
import { record, string, any } from 'superstruct';
import { PharmacySelect } from '@photonhealth/components';

const pharmacyValidator = message(
  record(string(), any()),
  'Please select or search for a pharmacy...'
);

export const OrderCard = (props: {
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
}) => {
  props.actions.registerValidator({
    key: 'pharmacy',
    validator: pharmacyValidator
  });

  const patientIds = createMemo(() =>
    props.store['patient']?.value ? [props.store['patient']?.value?.id] : []
  );

  return (
    <photon-card>
      <div class="flex flex-row">
        <p class="font-sans text-l font-medium flex-grow">Select Pharmacy</p>
      </div>
      <PharmacySelect
        displaySendToPatient
        displayLocalPickup
        patientIds={patientIds()}
        mailOrderPharmacyIds={['phr_01GA9HPVBVJ0E65P819FD881N0', 'phr_01GCA54GVKA06C905DETQ9SY98']}
        setFufillmentType={(t: any) => console.log('fulfillmentType: ', t)}
        setPharmacyId={(p: any) => console.log('pharmacyId: ', p)}
      />
    </photon-card>
  );
};
