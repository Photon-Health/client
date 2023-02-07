/* This file contains helper functions that can be used anywhere in the app */
import parsePhoneNumber from 'libphonenumber-js';

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
function formatDate(date: string | Date) {
  return new Date(date)?.toLocaleDateString();
}

// Format date to Month D, Yr
function formatDateLong(date: string | Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date(date)?.toLocaleDateString([], options);
}

// Format phone number to (###) ###-####
function formatPhone(phone: string) {
  return parsePhoneNumber(phone, 'US')?.formatNational();
}

interface FormatAddressProps {
  city: string;
  country: string;
  postalCode: string;
  state: string;
  street1: string;
  street2?: any;
}

function formatAddress(address: FormatAddressProps) {
  const { city, postalCode, state, street1, street2 } = address;
  return `${titleCase(street1)}${street2 ? `, ${titleCase(street2)}` : ''}, ${titleCase(
    city
  )}, ${state} ${postalCode}`;
}

function formatFills(fills: any) {
  return fills.reduce((prev: string, cur: any) => {
    const fill = cur.treatment.name;
    return prev ? `${prev}, ${fill}` : fill;
  }, '');
}

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const unique = (array: any[], propertyName: string) => {
  return array.filter(
    (e: any, i: number) => array.findIndex((a: any) => a[propertyName] === e[propertyName]) === i
  );
};

export {
  formatDate,
  formatDateLong,
  formatFills,
  formatPhone,
  formatAddress,
  capitalizeFirst,
  titleCase,
  unique
};
