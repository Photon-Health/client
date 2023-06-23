import { createMemo, createSignal, For } from 'solid-js';
import Card from '../../particles/Card';
import RadioGroup from '../../particles/RadioGroup';
import Tabs from '../../particles/Tabs';
import PharmacySearch from '../PharmacySearch';
import { MailOrderPharmacy } from './MailOrderPharmacy';
import { PatientDetails } from './PatientDetails';

interface PharmacySelectProps {
  mailOrderPharmacyIds?: string[];
  patientIds?: string[];
}

export default function PharmacySelect(props: PharmacySelectProps) {
  const tabs = ['Send to Patient', 'Local Pickup', 'Mail Order'];
  const [tab, setTab] = createSignal(tabs[0]);
  const hasMailOrder = createMemo(() => (props?.mailOrderPharmacyIds?.length || 0) > 0);

  return (
    <Card>
      <div>
        <Tabs
          tabs={hasMailOrder() ? tabs : tabs.slice(0, -1)}
          activeTab={tab()}
          setActiveTab={(newTab: string) => setTab(newTab)}
        />

        <div class="pt-4">
          {tab() === 'Send to Patient' && (
            <RadioGroup label="Patients" initSelected={props?.patientIds?.[0]}>
              <For each={props?.patientIds || []}>
                {(id) => (
                  <RadioGroup.Option value={id}>
                    <PatientDetails patientId={id} />
                  </RadioGroup.Option>
                )}
              </For>
            </RadioGroup>
          )}

          {tab() === 'Local Pickup' && (
            <PharmacySearch
              setPharmacy={(pharmacy) => {
                // TODO set pharmacy
                console.log(pharmacy);
              }}
            />
          )}

          {tab() === 'Mail Order' && (
            <RadioGroup label="Pharmacies">
              <For each={props?.mailOrderPharmacyIds || []}>
                {(id) => (
                  <RadioGroup.Option value={id}>
                    <MailOrderPharmacy pharmacyId={id} />
                  </RadioGroup.Option>
                )}
              </For>
            </RadioGroup>
          )}
        </div>
      </div>
    </Card>
  );
}
