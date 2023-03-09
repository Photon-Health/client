import { createEffect, createSignal } from 'solid-js';
import { usePhoton } from '../../context';

export default function Test(props: { uP?: any }) {
  const client = props.uP ? props.uP() : usePhoton();
  const [trigger, setTrigger] = createSignal(false);

  createEffect(async () => {
    if (trigger()) {
      setTrigger(false);
      const data = await client?.clinical.patient.getPatient({
        id: 'pat_01GQGDNW09VRK2CQ0Q41H57RVK'
      });
      console.log(data);
    }
  });

  return (
    <div>
      <button onClick={() => setTrigger(!trigger())}>Trigger</button>
    </div>
  );
}
