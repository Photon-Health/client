import { createMemo, createSignal } from 'solid-js';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Input from '../../particles/Input';
import InputGroup from '../../particles/InputGroup';
import UnitSelect from './components/UnitSelect';
import conversionFactors from './utils/conversionFactors';

const round = (num: number, places: number) => parseFloat(num.toFixed(places));

type DosageUnit = 'mcg/kg' | 'mg/kg' | 'g/kg';
type WeightUnit = 'lbs' | 'kg';
type DosageFrequency = 'day' | 'week';
type LiquidUnit = 'mcg' | 'mg' | 'g';
type LiquidVolume = 'mL' | 'L';

const dosageUnits: DosageUnit[] = ['mcg/kg', 'mg/kg', 'g/kg'];
const dosageFrequencies: DosageFrequency[] = ['day', 'week'];
const weightUnits: WeightUnit[] = ['lbs', 'kg'];
const liquidUnits: LiquidUnit[] = ['mcg', 'mg', 'g'];
const liquidVolumes: LiquidVolume[] = ['mL', 'L'];

export interface DoseCalculatorProps {
  open: boolean;
  setClose: () => {};
  medication?: string;
}

export default function DoseCalculator(props: DoseCalculatorProps) {
  const [dosage, setDosage] = createSignal<number>(0);
  const [dosageUnit, setDosageUnit] = createSignal<DosageUnit>(dosageUnits[0]);
  const [dosageFrequency, setDosageFrequency] = createSignal<DosageFrequency>(dosageFrequencies[0]);

  const [weight, setWeight] = createSignal<number>(0);
  const [weightUnit, setWeightUnit] = createSignal<WeightUnit>(weightUnits[0]);

  const [liquidConcentration, setLiquidConcentration] = createSignal<number>(0);
  const [liquidUnit, setLiquidUnit] = createSignal<LiquidUnit>(liquidUnits[0]);
  const [perVolume, setPerVolume] = createSignal<number>(0);
  const [perVolumeUnit, setPerVolumeUnit] = createSignal<LiquidVolume>(liquidVolumes[0]);

  const [daysSupply, setDaysSupply] = createSignal<number>(1);
  const [dosesPerDay, setDosesPerDay] = createSignal<number>(1);

  const dose = createMemo(() => {
    const factor = conversionFactors[dosageUnit()][weightUnit()];
    return factor * dosage() * weight();
  });

  const liquidDose = createMemo(() => {
    if (!liquidConcentration() || parseInt(liquidConcentration().toString(), 10) === 0) {
      return 0;
    }
    const factor = conversionFactors[dosageUnit()][liquidUnit()];
    return (dose() * perVolume()) / (liquidConcentration() * factor);
  });

  const singleDose = createMemo(() => {
    const amount = dose() / dosesPerDay();
    return `${round(amount, 1)} ${dosageUnit().split('/')[0]}`;
  });
  const singleLiquidDose = createMemo(() => {
    const amount = liquidDose() / dosesPerDay();
    return `${round(amount, 1)} ${perVolumeUnit()}`;
  });
  const totalQuantity = createMemo(() => {
    const amount = dose() * daysSupply();
    return `${round(amount, 1)} ${dosageUnit().split('/')[0]}`;
  });

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
          <div class="grid grid-cols-2 gap-4">
            <div class="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={dosage()}
                onInput={(e) => setDosage(e.currentTarget.valueAsNumber)}
              />
              <UnitSelect setSelected={setDosageUnit} options={dosageUnits} initialIdx={1} />
            </div>
            <div class="flex gap-4 items-center">
              <p>per</p>
              <div class="grow">
                <UnitSelect setSelected={setDosageFrequency} options={dosageFrequencies} />
              </div>
            </div>
          </div>
        </InputGroup>
        <InputGroup label="Patient Weight">
          <div class="grid grid-cols-2 gap-4">
            <div class="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={weight()}
                onInput={(e) => setWeight(e.currentTarget.valueAsNumber)}
              />
              <UnitSelect setSelected={setWeightUnit} options={weightUnits} />
            </div>
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
            <UnitSelect setSelected={setLiquidUnit} options={liquidUnits} initialIdx={1} />
          </div>
        </InputGroup>
        <InputGroup label="Per Volume">
          <div class="flex gap-2">
            <Input
              type="number"
              value={perVolume()}
              onInput={(e) => setPerVolume(e.currentTarget.valueAsNumber)}
            />
            <UnitSelect setSelected={setPerVolumeUnit} options={liquidVolumes} />
          </div>
        </InputGroup>
      </div>

      <div class="mt-4">
        <h3>Frequency</h3>
        <div class="grid grid-cols-2 gap-4">
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
        <div class="grid grid-cols-2 gap-4">
          <InputGroup label="Single Dose">
            <Input type="text" value={singleDose()} disabled />
          </InputGroup>
          <InputGroup label="Single Liquid Dose">
            <Input type="text" value={singleLiquidDose()} disabled />
          </InputGroup>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <InputGroup label="Total Quantity">
            <Input type="text" value={totalQuantity()} disabled />
          </InputGroup>
        </div>
      </div>

      <div class="flex gap-4 justify-end">
        <Button variant="secondary" onClick={props.setClose}>
          Cancel
        </Button>
        <Button>Autofill</Button>
      </div>
    </Dialog>
  );
}
