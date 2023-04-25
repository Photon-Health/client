import { For, createSignal } from 'solid-js';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Input from '../../particles/Input';
import ComboBox from '../../particles/ComboBox';
import InputGroup from '../../particles/InputGroup';

export interface DoseCalculatorProps {
  open: boolean;
  setClose: () => {};
  medication?: string;
}

type DosageUnit = 'mcg/kg' | 'mg/kg' | 'g/kg';
type DosageFrequency = 'day' | 'week';
type WeightUnit = 'lbs' | 'kg';
type LiquidUnit = 'mcg' | 'mg' | 'g';
type LiquidVolume = 'mL' | 'L';

type RecordWithId<T> = { id: string; name: T };
const arrayToRecord = <T extends {}>(arr: T[]): RecordWithId<T>[] =>
  arr.map((a, i) => ({ id: i.toString(), name: a }));

const dosageUnits: DosageUnit[] = ['mcg/kg', 'mg/kg', 'g/kg'];
const dosageUnitsMap: RecordWithId<DosageUnit>[] = arrayToRecord(dosageUnits);
const dosageFrequencies: DosageFrequency[] = ['day', 'week'];
const dosageFrequenciesMap: RecordWithId<DosageFrequency>[] = arrayToRecord(dosageFrequencies);

const weightUnits: WeightUnit[] = ['lbs', 'kg'];
const weightUnitsMap: RecordWithId<WeightUnit>[] = arrayToRecord(weightUnits);

const liquidUnits: LiquidUnit[] = ['mcg', 'mg', 'g'];
const liquidUnitsMap: RecordWithId<LiquidUnit>[] = arrayToRecord(liquidUnits);
const liquidVolumes: LiquidVolume[] = ['mL', 'L'];
const liquidVolumesMap: RecordWithId<LiquidVolume>[] = arrayToRecord(liquidVolumes);

function UnitSelect<T extends string>({
  value,
  setSelected,
  options
}: {
  value: RecordWithId<T>;
  setSelected: (value: RecordWithId<T>) => void;
  options: RecordWithId<T>[];
}) {
  const displayValue = (unit: RecordWithId<any>) => unit.name;

  return (
    <ComboBox value={value} setSelected={setSelected}>
      <ComboBox.Input displayValue={displayValue} />
      <ComboBox.Options>
        <For each={options}>
          {(unit) => (
            <ComboBox.Option key={unit.id} value={unit}>
              {unit.name}
            </ComboBox.Option>
          )}
        </For>
      </ComboBox.Options>
    </ComboBox>
  );
}

export default function DoseCalculator(props: DoseCalculatorProps) {
  const [dosage, setDosage] = createSignal<number>(0);
  const [dosageUnit, setDosageUnit] = createSignal<RecordWithId<DosageUnit>>(dosageUnitsMap[0]);
  const [dosageFrequency, setDosageFrequency] = createSignal<RecordWithId<DosageFrequency>>(
    dosageFrequenciesMap[0]
  );

  const [weight, setWeight] = createSignal<number>(0);
  const [weightUnit, setWeightUnit] = createSignal<RecordWithId<WeightUnit>>(weightUnitsMap[0]);

  const [liquidConcentration, setLiquidConcentration] = createSignal<number>(0);
  const [liquidUnit, setLiquidUnit] = createSignal<RecordWithId<LiquidUnit>>(liquidUnitsMap[0]);
  const [perVolume, setPerVolume] = createSignal<number>(0);
  const [perVolumeUnit, setPerVolumeUnit] = createSignal<RecordWithId<LiquidVolume>>(
    liquidVolumesMap[0]
  );

  const [daysSupply, setDaysSupply] = createSignal<number>(0);
  const [dosesPerDay, setDosesPerDay] = createSignal<number>(0);

  const [singleDose, setSingleDose] = createSignal<number>(0);
  const [singleLiquidDose, setSingleLiquidDose] = createSignal<number>(0);
  const [totalQuantity, setTotalQuantity] = createSignal<number>(0);

  const displayValue = (unit: RecordWithId<any>) => unit.name;

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
            <UnitSelect value={dosageUnit()} setSelected={setDosageUnit} options={dosageUnitsMap} />
            <p>per</p>
            <UnitSelect
              value={dosageFrequency()}
              setSelected={setDosageFrequency}
              options={dosageFrequenciesMap}
            />
          </div>
        </InputGroup>

        <InputGroup label="Patient Weight">
          <div class="flex gap-2">
            <Input
              type="number"
              value={weight()}
              onInput={(e) => setWeight(e.currentTarget.valueAsNumber)}
            />
            <UnitSelect value={weightUnit()} setSelected={setWeightUnit} options={weightUnitsMap} />
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
            <UnitSelect value={liquidUnit()} setSelected={setLiquidUnit} options={liquidUnitsMap} />
          </div>
        </InputGroup>
        <InputGroup label="Per Volume">
          <div class="flex gap-2">
            <Input
              type="number"
              value={perVolume()}
              onInput={(e) => setPerVolume(e.currentTarget.valueAsNumber)}
            />
            <UnitSelect
              value={perVolumeUnit()}
              setSelected={setPerVolumeUnit}
              options={liquidVolumesMap}
            />
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
      <div class="flex gap-4 justify-end">
        <Button variant="secondary" onClick={props.setClose}>
          Cancel
        </Button>
        <Button>Autofill</Button>
      </div>{' '}
    </Dialog>
  );
}
