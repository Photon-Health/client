/* This file contains helper functions that can be used anywhere in the app */
import parsePhoneNumber from 'libphonenumber-js';
import { Fill } from 'packages/sdk/dist/types';

function titleCase(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Format date to local date string (MM/DD/YYYY)
function formatDate(date: string) {
  return new Date(date)?.toLocaleDateString('en-US', { timeZone: 'UTC' });
}

// Format date to Month D, Yr
function formatDateLong(date: string | Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  };
  return new Date(date)?.toLocaleDateString([], options);
}

// Format phone number to (###) ###-####
function formatPhone(phone: string) {
  return parsePhoneNumber(phone, 'US')?.formatNational();
}

export interface FormatAddressProps {
  city: string;
  country: string;
  postalCode: string;
  state: string;
  street1: string;
  street2?: any;
}

function formatAddress(address: FormatAddressProps | undefined) {
  if (!address) return '';
  const { city, postalCode, state, street1, street2 } = address;
  return `${titleCase(street1)}${street2 ? `, ${titleCase(street2)}` : ''}, ${titleCase(
    city
  )}, ${state} ${postalCode}`;
}

function getMedicationNames(fills: any): string[] {
  const treatmentNames = new Set<string>();
  fills.forEach((fill: Fill) => treatmentNames.add(fill.treatment.name));
  return Array.from(treatmentNames);
}

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const unique = (array: any[], propertyName: string) => {
  return array.filter(
    (e: any, i: number) => array.findIndex((a: any) => a[propertyName] === e[propertyName]) === i
  );
};

// list derived from dispense_unit table
const quantityAbbreviations: { [key: string]: string } = {
  each: 'ea',
  milliliter: 'ml',
  gram: 'g',
  applicator: 'appl',
  blister: 'blst',
  caplet: 'cap',
  capsule: 'cap',
  film: 'flm',
  gum: 'gum',
  implant: 'impl',
  insert: 'ins',
  kit: 'kit',
  lancet: 'lanc',
  lozenge: 'loz',
  packet: 'pkt',
  pad: 'pad',
  patch: 'patch',
  penneedle: 'pneedle',
  ring: 'ring',
  sponge: 'spng',
  stick: 'stk',
  strip: 'strip',
  suppository: 'supp',
  swab: 'swab',
  tablet: 'tab',
  troche: 'troche',
  unspecified: 'unsp',
  wafer: 'wafer'
};

function getUnitAbbreviation(quantity: string): string {
  const loweredQuantity = quantity.toLowerCase();
  return quantityAbbreviations[loweredQuantity] || quantity;
}

export {
  formatDate,
  formatDateLong,
  getMedicationNames,
  formatPhone,
  formatAddress,
  capitalizeFirst,
  titleCase,
  unique,
  getUnitAbbreviation
};
