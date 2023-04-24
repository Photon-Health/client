import { For, createSignal } from 'solid-js';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Input from '../../particles/Input';
import ComboBox from '../../particles/ComboBox';
import InputGroup from '../../particles/InputGroup';
import { DosageUnit } from './utils/doseTools';

export interface DoseCalculatorProps {
  open: boolean;
  setClose: () => {};
  medication?: string;
}

const doseUnits = ['mcg/kg', 'mg/kg', 'g/kg'];
const doseFrequency = ['day', 'week'];

export default function DoseCalculator(props: DoseCalculatorProps) {
  const [dosage, setDosage] = createSignal<number>(0);
  const [dosageUnit, setDosageUnit] = createSignal<DosageUnit>('mg/kg');

  const [weight, setWeight] = createSignal<number>(0);
  const [weightUnit, setWeightUnit] = createSignal<string>('lbs');

  const [liquidConcentration, setLiquidConcentration] = createSignal<number>(0);
  const [perVolume, setPerVolume] = createSignal<number>(0);

  const [daysSupply, setDaysSupply] = createSignal<number>(0);
  const [dosesPerDay, setDosesPerDay] = createSignal<number>(0);

  const [singleDose, setSingleDose] = createSignal<number>(0);
  const [singleLiquidDose, setSingleLiquidDose] = createSignal<number>(0);
  const [totalQuantity, setTotalQuantity] = createSignal<number>(0);

  return (
    <Dialog open={props.open} setClose={props.setClose} size="lg">
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
            <Input
              type="number"
              value={dosage()}
              onInput={(e) => setDosage(e.currentTarget.valueAsNumber)}
            />
            <ComboBox>
              <ComboBox.Input displayValue={() => ''} />
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
              <ComboBox.Input displayValue={() => ''} />
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
            <Input
              type="number"
              value={weight()}
              onInput={(e) => setWeight(e.currentTarget.valueAsNumber)}
            />
            <ComboBox>
              <ComboBox.Input displayValue={() => ''} />
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
            <Input
              type="number"
              value={liquidConcentration()}
              onInput={(e) => setLiquidConcentration(e.currentTarget.valueAsNumber)}
            />
            <ComboBox>
              <ComboBox.Input displayValue={() => ''} />
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
            <Input
              type="number"
              value={perVolume()}
              onInput={(e) => setPerVolume(e.currentTarget.valueAsNumber)}
            />
            <ComboBox>
              <ComboBox.Input displayValue={() => ''} />
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
            <Input
              type="number"
              value={daysSupply()}
              onInput={(e) => setDaysSupply(e.currentTarget.valueAsNumber)}
            />
          </InputGroup>
          <InputGroup label="Doses per Day">
            <Input
              type="number"
              value={dosesPerDay()}
              onInput={(e) => setDosesPerDay(e.currentTarget.valueAsNumber)}
            />
          </InputGroup>
        </div>
      </div>
      <div class="mt-4">
        <h3>Dosage</h3>
        <div class="flex gap-2">
          <InputGroup label="Single Dose">
            <Input
              type="number"
              value={singleDose()}
              onInput={(e) => setSingleDose(e.currentTarget.valueAsNumber)}
            />
          </InputGroup>
          <InputGroup label="Single Liquid Dose">
            <Input
              type="number"
              value={singleLiquidDose()}
              onInput={(e) => setSingleLiquidDose(e.currentTarget.valueAsNumber)}
            />
          </InputGroup>
        </div>
        <div class="flex gap-2">
          <InputGroup label="Total Quantity">
            <Input
              type="number"
              value={totalQuantity()}
              onInput={(e) => setTotalQuantity(e.currentTarget.valueAsNumber)}
            />
          </InputGroup>
        </div>
      </div>
      {/* ... */}
    </Dialog>
  );
}
