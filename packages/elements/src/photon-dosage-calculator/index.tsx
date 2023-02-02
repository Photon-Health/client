import { Medication } from '@photonhealth/sdk/dist/types';
import { customElement } from 'solid-element';
import { createEffect, createSignal } from 'solid-js';
import tailwind from '../tailwind.css?inline';
import { DosageUnitsDropdown } from './components/DosageUnitsDropdown';
import { LiquidDosageUnitsDropdown } from './components/LiquidDosageUnitsDropdown';
import { VolumeUnitsDropdown } from './components/VolumeUnitsDropdown';
import { WeightUnitsDropdown } from './components/WeightUnitsDropdown';

const compatibleDosageWeight = (dosageUnit: string, weightUnit: string) => {
  if ((weightUnit === 'kgs' || weightUnit === 'g') && dosageUnit.includes('kg')) {
    return true;
  }
  if ((weightUnit === 'lbs' || weightUnit === 'oz') && dosageUnit.includes('lb')) {
    return true;
  }
  return false;
};

const convertCompatibleWeight = (dosageUnit: string, weight: { value: number; unit: string }) => {
  if (dosageUnit.includes('kg') && weight.unit === 'oz') {
    return (weight.value / 16) * 0.453592;
  }
  if (dosageUnit.includes('kg') && weight.unit === 'lbs') {
    return weight.value * 0.453592;
  }
  if (dosageUnit.includes('lb') && weight.unit === 'kgs') {
    return weight.value * 2.20462;
  }
  if (dosageUnit.includes('lb') && weight.unit === 'g') {
    return (weight.value / 1000) * 2.20462;
  }
  return 0;
};

const compatibleLiquid = (dosageUnit: string, liquidDosageUnit: string) => {
  if (liquidDosageUnit === 'mcg' && dosageUnit.split('/')[0] === 'mcg') {
    return true;
  }
  if (liquidDosageUnit === 'mg' && dosageUnit.split('/')[0] === 'mg') {
    return true;
  }
  if (liquidDosageUnit === 'g' && dosageUnit.split('/')[0] === 'g') {
    return true;
  }
  return false;
};

const convertCompatibleLiquid = (dosageUnit: string, liquid: { value: number; unit: string }) => {
  if (dosageUnit.includes('mcg') && liquid.unit === 'mcg') {
    return liquid.value / (1000 * 1000);
  }
  if (dosageUnit.includes('mcg') && liquid.unit === 'g') {
    return liquid.value * (1000 * 1000);
  }
  if (dosageUnit.includes('mg') && liquid.unit === 'mcg') {
    return liquid.value / 1000;
  }
  if (dosageUnit.includes('mg') && liquid.unit === 'g') {
    return liquid.value * 1000;
  }
  if (dosageUnit.includes('g') && liquid.unit === 'mcg') {
    return liquid.value / (1000 * 1000);
  }
  if (dosageUnit.includes('g') && liquid.unit === 'mg') {
    return liquid.value / 1000;
  }

  return 0;
};

const calculateDosage = (
  dosage: {
    value: number;
    unit: string;
  },
  weight: { value: number; unit: string }
) => {
  if (compatibleDosageWeight(dosage.unit, weight.unit) && weight.unit === 'g') {
    return dosage.value * (weight.value / 1000);
  }
  if (compatibleDosageWeight(dosage.unit, weight.unit) && weight.unit === 'oz') {
    return dosage.value * (weight.value / 16);
  }
  if (compatibleDosageWeight(dosage.unit, weight.unit)) {
    return dosage.value * weight.value;
  }
  return dosage.value * convertCompatibleWeight(dosage.unit, weight);
};

const calculateLiquidDosage = (
  dosage: number,
  dosage_unit: string,
  drug: number,
  drug_unit: string,
  volume: number
) => {
  if (
    drug === 0 ||
    drug.toString().length === 0 ||
    parseInt(drug.toString(), 10) === 0 ||
    window.isNaN(drug)
  ) {
    return 0;
  }
  if (compatibleLiquid(dosage_unit, drug_unit)) {
    return (dosage * volume) / drug;
  }
  return (dosage * volume) / convertCompatibleLiquid(dosage_unit, { value: drug, unit: drug_unit });
};

customElement(
  'photon-dosage-calculator',
  {
    medication: undefined,
  },
  (props: { medication?: Medication }) => {
    let ref: any;
    const [dosage, setDosage] = createSignal<number>(0);
    const [liquidDosage, setLiquidDosage] = createSignal<number>(0);
    const [weight, setWeight] = createSignal<number>(0);
    const [volume, setVolume] = createSignal<number>(0);
    const [dosageUnit, setDosageUnit] = createSignal<string>('mg/kg');
    const [weightUnit, setWeightUnit] = createSignal<string>('lbs');
    const [liquidDosageUnit, setLiquidDosageUnit] = createSignal<string>('mg');
    const [volumeUnit, setVolumeUnit] = createSignal<string>('mL');
    const [doseResult, setDoseResult] = createSignal<string>('');
    const [liquidDoesResult, setLiquidDosageResult] = createSignal<string>('');

    const dispatchDosageSelected = (liquid: boolean) => {
      const event = new CustomEvent('photon-dosage-selected', {
        composed: true,
        bubbles: true,
        detail: {
          value: Number(liquid ? liquidDoesResult().split(' ')[0] : doseResult().split(' ')[0]),
          unit: liquid ? liquidDoesResult().split(' ')[1] : doseResult().split(' ')[1],
        },
      });
      ref?.dispatchEvent(event);
    };

    createEffect(() => {
      let dose = calculateDosage(
        {
          value: dosage(),
          unit: dosageUnit(),
        },
        {
          value: weight(),
          unit: weightUnit(),
        }
      );
      if (dose.toString().split('.').length > 1 && dose.toString().split('.')[1].length > 4) {
        dose = parseFloat(dose.toFixed(4));
      }
      setDoseResult(`${dose} ${dosageUnit().split('/')[0]}`);
      let liquidDose = calculateLiquidDosage(
        dose,
        dosageUnit().split('/')[0],
        liquidDosage(),
        liquidDosageUnit(),
        volume()
      );
      if (
        liquidDosage.toString().split('.').length > 1 &&
        liquidDosage.toString().split('.')[1].length > 4
      ) {
        liquidDose = parseFloat(liquidDose.toFixed(4));
      }
      setLiquidDosageResult(`${liquidDose} ${volumeUnit()}`);
    }, [
      dosage,
      dosageUnit,
      weightUnit,
      weight,
      liquidDosage,
      volume,
      liquidDosageUnit,
      volumeUnit,
    ]);

    return (
      <div ref={ref}>
        <style>{tailwind}</style>
        <div class="flex flex-col xs:flex-row items-start xs:items-center gap-2 pb-2">
          <p class="font-sans text-lg">Selected Drug: </p>
          {props.medication ? (
            <p>{props.medication.name}</p>
          ) : (
            <p class="text-gray-500 font-sans italic">None selected</p>
          )}
        </div>
        <div class="flex flex-col">
          <p class="font-sans pb-1">Input</p>
          <div
            class="flex items-center"
            on:photon-input-changed={(e: any) => {
              setDosage(e.detail.input);
            }}
            on:photon-unit-selected={(e: any) => {
              setDosageUnit(e.detail.unit);
            }}
          >
            <p class="font-sans text-gray-700 text-sm mb-7 basis-56 xs:basis-60">Dosage</p>
            <photon-number-input
              min={0}
              value={0}
              class="mb-1.5 max-w-[140px] pl-3 xs:pl-4 pr-3"
            ></photon-number-input>
            <DosageUnitsDropdown></DosageUnitsDropdown>
          </div>
          <div
            class="flex items-center"
            on:photon-input-changed={(e: any) => {
              setWeight(e.detail.input);
            }}
            on:photon-unit-selected={(e: any) => {
              setWeightUnit(e.detail.unit);
            }}
          >
            <p class="font-sans text-gray-700 text-sm mb-7 basis-56 xs:basis-60">Weight</p>
            <photon-number-input
              min={0}
              value={0}
              class="mb-1.5 max-w-[140px] pl-3 xs:pl-4 pr-3"
            ></photon-number-input>
            <WeightUnitsDropdown></WeightUnitsDropdown>
          </div>
          <p class="font-sans pb-1">Liquid Formation</p>
          <div
            class="flex items-center"
            on:photon-input-changed={(e: any) => {
              setLiquidDosage(e.detail.input);
            }}
            on:photon-unit-selected={(e: any) => {
              setLiquidDosageUnit(e.detail.unit);
            }}
          >
            <p class="font-sans text-gray-700 text-sm mb-7 basis-56 xs:basis-60">Drug Amount</p>
            <photon-number-input
              min={0}
              value={0}
              class="mb-1.5 max-w-[140px] pl-3 xs:pl-4 pr-3 flex-shrink"
            ></photon-number-input>
            <LiquidDosageUnitsDropdown></LiquidDosageUnitsDropdown>
          </div>
          <div
            class="flex items-center"
            on:photon-input-changed={(e: any) => {
              setVolume(e.detail.input);
            }}
            on:photon-unit-selected={(e: any) => {
              setVolumeUnit(e.detail.unit);
            }}
          >
            <p class="font-sans text-gray-700 text-sm mb-7 basis-56 xs:basis-60">Per Volume</p>
            <photon-number-input
              min={0}
              value={0}
              class="mb-1.5 max-w-[140px] pl-3 xs:pl-4 pr-3"
            ></photon-number-input>
            <VolumeUnitsDropdown></VolumeUnitsDropdown>
          </div>
          <p class="font-sans">Result</p>
          <div class="flex items-center">
            <p class="font-sans text-gray-700 text-sm mb-7 basis-36 xs:basis-[10.5rem]">Dose</p>
            <photon-text-input
              value={doseResult() ?? '0'}
              class="mb-1.5 max-w-[180px] pl-3 pr-3"
              disabled={true}
            ></photon-text-input>
            <photon-button class="mb-7" on:photon-clicked={() => dispatchDosageSelected(false)}>
              Use<sl-icon name="chevron-right" slot="postfix"></sl-icon>
            </photon-button>
          </div>
          <div class="flex items-center">
            <p class="font-sans text-gray-700 text-sm mb-7 basis-36 xs:basis-[10.5rem]">
              Liquid Dose
            </p>
            <photon-text-input
              value={liquidDoesResult() ?? '0'}
              class="mb-1.5 max-w-[180px] pl-3 pr-3"
              disabled={true}
            ></photon-text-input>
            <photon-button class="mb-7" on:photon-clicked={() => dispatchDosageSelected(true)}>
              Use<sl-icon name="chevron-right" slot="postfix"></sl-icon>
            </photon-button>
          </div>
        </div>
      </div>
    );
  }
);
