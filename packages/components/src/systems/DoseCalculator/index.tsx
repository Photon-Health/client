import { For, createSignal } from 'solid-js';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Input from '../../particles/Input';
import ComboBox from '../../particles/ComboBox';
import InputGroup from '../../particles/InputGroup';

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
        <Icon name="calculator" size="sm" />
      </Button>
      <Dialog open={open()} onClose={() => setOpen(false)} size="lg">
        <h2>Calculate Dose Quantity</h2>
        <p>Enter desired dosage and patient weight to calculate total and dose quantity.</p>

        <div class="mt-4">
          <h3>Selected Medication</h3>
          <p>{props?.medication || 'None Selected'}</p>
        </div>

        <div class="mt-4">
          <h3>Dosage Inputs</h3>

          <InputGroup label="Dose">
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
          </InputGroup>

          <InputGroup label="Patient Weight">
            <div class="flex gap-2">
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
          </InputGroup>
        </div>
        <div class="flex gap-4 mt-4">
          <InputGroup label="Liquid Concentration">
            <div class="flex gap-2">
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
          </InputGroup>
          <InputGroup label="Per Volume">
            <div class="flex gap-2">
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
          </InputGroup>
        </div>
        <div class="mt-4">
          <h3>Frequency</h3>
          <div class="flex gap-2">
            <InputGroup label="Days Supply">
              <Input />
            </InputGroup>
            <InputGroup label="Doses per Day">
              <Input />
            </InputGroup>
          </div>
        </div>
        <div class="mt-4">
          <h3>Dosage</h3>
          <div class="flex gap-2">
            <InputGroup label="Single Dose">
              <Input />
            </InputGroup>
            <InputGroup label="Single Liquid Dose">
              <Input />
            </InputGroup>
          </div>
          <div class="flex gap-2">
            <InputGroup label="Total Quantity">
              <Input />
            </InputGroup>
          </div>
        </div>
        <div class="flex gap-4 justify-end">
          <Button variant="secondary">Cancel</Button>
          <Button>Autofill</Button>
        </div>
      </Dialog>
    </div>
  );
}
