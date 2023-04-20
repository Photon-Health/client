import { For, createSignal } from 'solid-js';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Input from '../../particles/Input';
import ComboBox from '../../particles/ComboBox';

export interface DoseCalculatorProps {
  medication?: string;
}

const doseUnits = ['mcg/kg', 'mg/kg', 'g/kg'];
const doseFrequency = ['day', 'week'];

export default function DoseCalculator(props: DoseCalculatorProps) {
  const [open, setOpen] = createSignal(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>
        <Icon name="calculator" />
      </Button>
      <Dialog open={open()} onClose={() => setOpen(false)} size="lg">
        <h2>Calculate Dose Quantity</h2>
        <p>Enter desired dosage and patient weight to calculate total and dose quantity.</p>

        <div class="mt-8">
          <h3>Selected Medication</h3>
          <p>{props?.medication || 'None Selected'}</p>
        </div>

        <div class="mt-8">
          <h3>Dosage Inputs</h3>
          <div class="flex items-center gap-2">
            <Input />
            <ComboBox>
              <ComboBox.Input />
              <ComboBox.Options>
                <For each={doseUnits.map((d, i) => ({ id: i, name: d }))}>
                  {(unit) => (
                    <ComboBox.Option key={unit.id.toString()} value={unit.name}>
                      {unit.name}
                    </ComboBox.Option>
                  )}
                </For>
              </ComboBox.Options>
            </ComboBox>
            <p>per</p>
            <ComboBox>
              <ComboBox.Input />
              <ComboBox.Options>
                <For each={doseFrequency.map((d, i) => ({ id: i, name: d }))}>
                  {(time) => (
                    <ComboBox.Option key={time.id.toString()} value={time.name}>
                      {time.name}
                    </ComboBox.Option>
                  )}
                </For>
              </ComboBox.Options>
            </ComboBox>
          </div>
          <h3>Patient Weight</h3>
          <div class="flex items-center gap-2">
            <Input />
            <ComboBox>
              <ComboBox.Input />
              <ComboBox.Options>
                <For each={doseUnits.map((d, i) => ({ id: i, name: d }))}>
                  {(unit) => (
                    <ComboBox.Option key={unit.id.toString()} value={unit.name}>
                      {unit.name}
                    </ComboBox.Option>
                  )}
                </For>
              </ComboBox.Options>
            </ComboBox>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
