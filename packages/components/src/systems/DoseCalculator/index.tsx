import { createMemo, createSignal } from 'solid-js';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Input from '../../particles/Input';
import InputGroup from '../../particles/InputGroup';
import Icon from '../../particles/Icon';
import UnitSelect from './components/UnitSelect';
import conversionFactors from './utils/conversionFactors';

const round = (num: number) => parseFloat(num.toFixed(1));

type DosageUnit = 'mcg/kg' | 'mg/kg' | 'g/kg';
type WeightUnit = 'lbs' | 'kg';
type DosageFrequency = 'day' | 'dose';
type LiquidUnit = 'mcg' | 'mg' | 'g';
type LiquidVolume = 'mL' | 'L';

const dosageUnits: DosageUnit[] = ['mcg/kg', 'mg/kg', 'g/kg'];
const dosageFrequencies: DosageFrequency[] = ['day', 'dose'];
const weightUnits: WeightUnit[] = ['lbs', 'kg'];
const liquidConcentrationUnits: LiquidUnit[] = ['mcg', 'mg', 'g'];
const liquidVolumes: LiquidVolume[] = ['mL', 'L'];

export interface DoseCalculatorProps {
  open: boolean;
  onClose: () => void;
  medicationName?: string;
  setAutocompleteValues: (data: {
    liquidDose: number;
    totalLiquid: number;
    unit: LiquidVolume;
  }) => void;
}

export default function DoseCalculator(props: DoseCalculatorProps) {
  const [dosage, setDosage] = createSignal<number>(0);
  const [dosageUnit, setDosageUnit] = createSignal<DosageUnit>(dosageUnits[0]);
  const [dosageFrequency, setDosageFrequency] = createSignal<DosageFrequency>(dosageFrequencies[0]);

  const [weight, setWeight] = createSignal<number>(0);
  const [weightUnit, setWeightUnit] = createSignal<WeightUnit>(weightUnits[0]);

  const [liquidConcentration, setLiquidConcentration] = createSignal<number>(0);
  const [liquidUnit, setLiquidUnit] = createSignal<LiquidUnit>(liquidConcentrationUnits[0]);
  const [perVolume, setPerVolume] = createSignal<number>(0);
  const [perVolumeUnit, setPerVolumeUnit] = createSignal<LiquidVolume>(liquidVolumes[0]);

  const [daysSupply, setDaysSupply] = createSignal<number>(1);
  const [dosesPerDay, setDosesPerDay] = createSignal<number>(1);

  const dose = createMemo(() => {
    const factor = conversionFactors.weight[weightUnit()];
    return factor * dosage() * weight();
  });
  const liquidDose = createMemo(() => {
    if (!liquidConcentration() || parseInt(liquidConcentration().toString(), 10) === 0) {
      return 0;
    }
    const factor = conversionFactors.liquid[dosageUnit()][liquidUnit()];
    return (dose() * perVolume()) / (liquidConcentration() * factor);
  });

  const singleDose = createMemo(() =>
    dosageFrequency() === 'day' ? dose() / dosesPerDay() : dose()
  );
  const totalQuantity = createMemo(() => singleDose() * daysSupply() * dosesPerDay());
  const solidUnit = createMemo(() => dosageUnit().split('/')[0]);

  const singleLiquidDose = createMemo(() =>
    dosageFrequency() === 'day' ? liquidDose() / dosesPerDay() : liquidDose()
  );
  const totalLiquidQuantity = createMemo(() => singleLiquidDose() * daysSupply() * dosesPerDay());

  return (
    <Dialog open={props.open} onClose={props.onClose} size="lg">
      <div class="flex items-center">
        <Icon name="calculator" class="mr-2" />
        <h2>Calculate Dose Quantity</h2>
      </div>
      <p>Enter desired dosage and patient weight to calculate total and dose quantity.</p>

      <div class="my-8">
        <div class="flex items-center">
          <Icon name="pencilSquare" class="mr-2" />
          <h3>Selected Medication</h3>
        </div>
        <p class={!props?.medicationName ? '@apply text-gray-400' : ''}>
          {props?.medicationName || 'None Selected'}
        </p>
      </div>

      <section class="mt-8">
        <div class="flex items-center">
          <Icon name="beaker" class="mr-2" />
          <h3>Dosage Inputs</h3>
        </div>
        <InputGroup label="Dose">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="grid grid-cols-2 gap-4 sm:gap-2">
              <Input
                type="number"
                inputmode="decimal"
                value={dosage()}
                onInput={(e: Event) => setDosage(e.currentTarget?.valueAsNumber)}
              />
              <UnitSelect setSelected={setDosageUnit} options={dosageUnits} initialIdx={1} />
            </div>
            <div class="flex gap-4 items-center">
              <div>per</div>
              <div class="grow">
                <UnitSelect setSelected={setDosageFrequency} options={dosageFrequencies} />
              </div>
            </div>
          </div>
        </InputGroup>
        <InputGroup label="Patient Weight">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="grid grid-cols-2 gap-4 sm:gap-2">
              <Input
                type="number"
                inputmode="decimal"
                value={weight()}
                onInput={(e: Event) => setWeight(e.currentTarget?.valueAsNumber)}
              />
              <UnitSelect setSelected={setWeightUnit} options={weightUnits} />
            </div>
          </div>
        </InputGroup>
        <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
          <InputGroup label="Liquid Concentration">
            <div class="flex gap-4 sm:gap-2">
              <Input
                type="number"
                inputmode="decimal"
                value={liquidConcentration()}
                onInput={(e: Event) => setLiquidConcentration(e.currentTarget?.valueAsNumber)}
              />
              <UnitSelect
                setSelected={setLiquidUnit}
                options={liquidConcentrationUnits}
                initialIdx={1}
              />
            </div>
          </InputGroup>
          <InputGroup label="Per Volume">
            <div class="flex gap-4 sm:gap-2">
              <Input
                type="number"
                inputmode="decimal"
                value={perVolume()}
                onInput={(e: Event) => setPerVolume(e.currentTarget?.valueAsNumber)}
              />
              <UnitSelect setSelected={setPerVolumeUnit} options={liquidVolumes} />
            </div>
          </InputGroup>
        </div>
      </section>

      <section class="mt-8">
        <div class="flex items-center">
          <Icon name="clock" class="mr-2" />
          <h3>Frequency</h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <InputGroup label="Duration in Days">
            <Input
              type="number"
              inputmode="decimal"
              value={daysSupply()}
              onInput={(e: Event) => setDaysSupply(e.currentTarget?.valueAsNumber)}
            />
          </InputGroup>
          <InputGroup label="Doses per Day">
            <Input
              type="number"
              inputmode="decimal"
              value={dosesPerDay()}
              onInput={(e: Event) => setDosesPerDay(e.currentTarget?.valueAsNumber)}
            />
          </InputGroup>
        </div>
      </section>

      <section class="mt-8">
        <div class="flex items-center">
          <Icon name="chartPie" class="mr-2" />
          <h3>Dosage</h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <InputGroup label="Single Dose">
            <Input type="text" value={`${round(singleDose())} ${solidUnit()}`} readonly copy />
          </InputGroup>
          <InputGroup label="Total Quantity">
            <Input type="text" value={`${round(totalQuantity())} ${solidUnit()}`} readonly copy />
          </InputGroup>
        </div>
        <hr class="h-px mb-4 bg-gray-200 border-0 dark:bg-gray-700 w-full" />
        <div class="grid grid-cols-2 gap-4">
          <InputGroup label="Single Liquid Dose">
            <Input
              type="text"
              value={`${round(singleLiquidDose())} ${perVolumeUnit()}`}
              readonly
              copy
            />
          </InputGroup>
          <InputGroup label="Total Liquid Quantity">
            <Input
              type="text"
              value={`${round(totalLiquidQuantity())} ${perVolumeUnit()}`}
              readonly
              copy
            />
          </InputGroup>
        </div>
      </section>

      <div class="mt-8 flex gap-4 justify-end">
        <Button variant="secondary" onClick={props.onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            props.setAutocompleteValues({
              liquidDose: round(singleLiquidDose()),
              totalLiquid: round(totalLiquidQuantity()),
              unit: perVolumeUnit()
            });
            props.onClose();
          }}
          disabled={totalLiquidQuantity() === 0}
        >
          Autofill
        </Button>
      </div>
    </Dialog>
  );
}
