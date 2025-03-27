import { createMemo, createSignal, onMount } from 'solid-js';
import Button from '../../../particles/Button';
import Dialog from '../../../particles/Dialog';
import Icon from '../../../particles/Icon';
import Input from '../../../particles/Input';
import InputGroup from '../../../particles/InputGroup';
import {
  DosageValue,
  LiquidDoseValue,
  LiquidVolumeUnits,
  LiquidVolumeValue,
  WeightUnits,
  WeightValue,
  calculateDosage,
  calculateLiquidDosage,
  dosageUnits,
  liquidDosageUnits,
  liquidVolumeUnits
} from '../utils/conversionFactors';
import UnitSelect from './UnitSelect';
import { number } from 'zod';

const round = (num: number) => parseFloat(num.toFixed(1));

type DosageFrequency = 'day' | 'dose';

const dosageFrequencies: DosageFrequency[] = ['day', 'dose'];
const weightUnits: WeightUnits[] = ['lb', 'kg'];

export interface DoseCalculatorProps {
  open: boolean;
  onClose: () => void;
  medicationName?: string;
  weight?: number;
  weightUnit?: string;
  setAutocompleteValues: (data: {
    days: number;
    liquidDose: number;
    totalLiquid: number;
    unit: LiquidVolumeUnits;
  }) => void;
}

const cleanWeightUnit = (
  weightUnitRaw: WeightUnits | string | undefined
): WeightUnits | undefined => {
  switch (weightUnitRaw?.toLowerCase()) {
    case 'kg':
    case 'kgs':
      return 'kg';
    case 'lb':
    case 'lbs':
      return 'lb';
    default:
      return undefined;
  }
};

const sanitizeValue = (value: number): number => (isNaN(value) || !isFinite(value) ? 0 : value);

export default function DoseCalculator(props: DoseCalculatorProps) {
  const [dosage, setDosage] = createSignal(0 as DosageValue);
  const [dosageUnit, setDosageUnit] = createSignal(dosageUnits[0]);
  const [dosageFrequency, setDosageFrequency] = createSignal(dosageFrequencies[0]);

  const [weight, setWeight] = createSignal(0 as WeightValue);
  const [weightUnit, setWeightUnit] = createSignal(weightUnits[0]);

  const [liquidConcentration, setLiquidConcentration] = createSignal(0 as LiquidDoseValue);
  const [liquidUnit, setLiquidUnit] = createSignal(liquidDosageUnits[0]);

  const [perVolume, setPerVolume] = createSignal(0 as LiquidVolumeValue);
  const [perVolumeUnit, setPerVolumeUnit] = createSignal(liquidVolumeUnits[0]);

  const [daysSupply, setDaysSupply] = createSignal<number>(1);
  const [dosesPerDay, setDosesPerDay] = createSignal<number>(1);

  onMount(() => {
    // We only set the weight and weight unit if we have a valid value
    const cleanedWeightUnit = cleanWeightUnit(props.weightUnit);
    if (cleanedWeightUnit) {
      if (props.weight) {
        setWeight(props.weight as WeightValue);
      }
      if (props.weightUnit) {
        setWeightUnit(cleanedWeightUnit);
      }
    } else {
      setWeight(0 as WeightValue);
      setWeightUnit('lb' as WeightUnits);
    }
  });

  const dose = createMemo(() => {
    // Need to do this because sometimes weightUnit is null
    return weightUnit()
      ? calculateDosage(
          { unit: dosageUnit(), value: dosage() },
          { unit: weightUnit(), value: weight() }
        )
      : (0 as DosageValue);
  });

  const liquidDose = createMemo(() =>
    calculateLiquidDosage(
      { unit: dosageUnit(), value: dose() },
      { unit: liquidUnit(), value: liquidConcentration() },
      { unit: perVolumeUnit(), value: perVolume() }
    )
  );

  const singleDose = createMemo(() =>
    sanitizeValue(dosageFrequency() === 'day' ? dose() / dosesPerDay() : dose())
  );

  const totalQuantity = createMemo(() =>
    sanitizeValue(singleDose() * daysSupply() * dosesPerDay())
  );

  const solidUnit = createMemo(() => dosageUnit().split('/')[0]);

  const singleLiquidDose = createMemo(() =>
    sanitizeValue(dosageFrequency() === 'day' ? liquidDose() / dosesPerDay() : liquidDose())
  );
  const totalLiquidQuantity = createMemo(() =>
    sanitizeValue(singleLiquidDose() * daysSupply() * dosesPerDay())
  );

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
                min="0"
                value={dosage()}
                onInput={(e) => setDosage((e.currentTarget?.valueAsNumber ?? 0) as DosageValue)}
                onFocusOut={(e) => setDosage(Math.max(e.currentTarget?.valueAsNumber || 0, 0) as DosageValue)}
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
                min="0"
                value={weight()}
                onInput={(e) => setWeight((e.currentTarget?.valueAsNumber ?? 0) as WeightValue)}
                onFocusOut={(e) => setWeight(Math.max(e.currentTarget?.valueAsNumber || 0, 0) as WeightValue)}
              />
              <UnitSelect
                setSelected={setWeightUnit}
                options={weightUnits}
                initialValue={weightUnit()}
              />
            </div>
          </div>
        </InputGroup>
        <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
          <InputGroup label="Liquid Concentration">
            <div class="flex gap-4 sm:gap-2">
              <Input
                type="number"
                inputmode="decimal"
                min="0"
                value={liquidConcentration()}
                onInput={(e) =>
                  setLiquidConcentration((e.currentTarget?.valueAsNumber ?? 0) as LiquidDoseValue)
                }
                onFocusOut={(e) =>
                  setLiquidConcentration(Math.max(e.currentTarget?.valueAsNumber || 0, 0) as LiquidDoseValue)
                }
              />
              <UnitSelect setSelected={setLiquidUnit} options={liquidDosageUnits} initialIdx={1} />
            </div>
          </InputGroup>
          <InputGroup label="Per Volume">
            <div class="flex gap-4 sm:gap-2">
              <Input
                type="number"
                inputmode="decimal"
                min="0"
                value={perVolume()}
                onInput={(e) =>
                  setPerVolume((e.currentTarget?.valueAsNumber ?? 0) as LiquidVolumeValue)
                }
                onFocusOut={(e) => 
                  setPerVolume(Math.max(e.currentTarget?.valueAsNumber || 0, 0) as LiquidVolumeValue)
                }
              />
              <UnitSelect setSelected={setPerVolumeUnit} options={liquidVolumeUnits} />
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
              min="1"
              value={daysSupply()}
              onInput={(e) => setDaysSupply(e.currentTarget?.valueAsNumber)}
              onFocusOut={(e) => setDaysSupply(Math.max(e.currentTarget?.valueAsNumber || 1, 1))}
            />
          </InputGroup>
          <InputGroup label="Doses per Day">
            <Input
              type="number"
              inputmode="decimal"
              min="1"
              value={dosesPerDay()}
              onInput={(e) => setDosesPerDay(e.currentTarget?.valueAsNumber)}
              onFocusOut={(e) => setDosesPerDay(Math.max(e.currentTarget?.valueAsNumber || 1, 1))}
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
              days: daysSupply(),
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
