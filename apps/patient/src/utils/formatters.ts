import { Address } from './models';

export const titleCase = (str: string) =>
  str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const formatAddress = (address: Address) => {
  const { city, postalCode, state, street1, street2 } = address;
  return `${titleCase(street1)}${street2 ? `, ${titleCase(street2)}` : ''}, ${titleCase(
    city
  )}, ${state} ${postalCode}`;
};

// Format date to local date string (MM/DD/YYYY)
export const formatDate = (date: string | Date) => new Date(date)?.toLocaleDateString();

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const formatPrice = (price: number): string => {
  return Number.isInteger(price) ? String(Math.round(price)) : price.toFixed(2);
};
