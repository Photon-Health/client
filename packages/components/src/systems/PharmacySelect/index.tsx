import { createMemo, createSignal } from 'solid-js';
import Tabs from '../../particles/Tabs';
import { MailOrderSelect } from '../MailOrderSelect';
import PharmacySearch from '../PharmacySearch';
interface PharmacySelectProps {
  mailOrderPharmacyIds?: string[];
}

export default function PharmacySelect(props: PharmacySelectProps) {
  const tabs = ['Send to Patient', 'Local Pickup', 'Mail Order'];
  const [tab, setTab] = createSignal(tabs[0]);
  const hasMailOrder = createMemo(() => (props?.mailOrderPharmacyIds?.length || 0) > 0);

  return (
    <>
      <Tabs
        tabs={hasMailOrder() ? tabs : tabs.slice(0, -1)}
        activeTab={tab()}
        setActiveTab={(newTab: string) => setTab(newTab)}
      />
      <div class="py-4">
        {tab() === 'Send to Patient' && <div>Send to Patient</div>}

        {tab() === 'Local Pickup' && (
          <PharmacySearch
            setPharmacy={(pharmacy) => {
              console.log(pharmacy);
            }}
          />
        )}

        {tab() === 'Mail Order' && (
          <MailOrderSelect pharmacyIds={props?.mailOrderPharmacyIds || []} />
        )}
      </div>
    </>
  );
}
