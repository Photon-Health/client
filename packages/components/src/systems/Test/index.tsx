import { createEffect, createSignal } from 'solid-js';
import { usePhoton } from '../../context';
import { PatientStore } from '../../stores/patient';

export default function Test(props: { uP?: any }) {
  const client = props.uP ? props.uP() : usePhoton();
  const [trigger, setTrigger] = createSignal(false);
  const { store, actions } = PatientStore;

  createEffect(async () => {
    if (trigger()) {
      setTrigger(false);
      const data = await client?.clinical.patient.getPatient({
        id: 'pat_01GQGDNW09VRK2CQ0Q41H57RVK'
      });

      console.log('fetch patient from sdk', data);

      await actions.getSelectedPatient(client!.getSDK(), 'pat_01GQGDNW09VRK2CQ0Q41H57RVK');
    }
  });

  createEffect(async () => {
    console.log('SElected patient through store actions', store.selectedPatient.data);
  });

  return (
    <div>
      <button onClick={() => setTrigger(!trigger())}>Trigger</button>
    </div>
  );
}
