import { Permission } from '@photonhealth/sdk/dist/types';
import queryString from 'query-string';

export const validateProps = (props: Record<string, any>, required: string[]) => {
  const errors: string[] = [];
  required.forEach((r) => {
    if (!Object.keys(props).includes(r) || props[r] == undefined) {
      errors.push(`photon-client requires ${r}, but no value was provided`);
    }
  });
  errors.forEach((e) => console.warn(e));
  return errors;
};

export const hasAuthParams = (searchParams = window.location.search): boolean => {
  const parsedParams = queryString.parse(searchParams);
  const { code, state, error, photon } = parsedParams;
  // if photon is not present, then these are auth params for a different Auth0 instance so we should ignore them
  return (code || error) !== null && state !== null && photon !== null;
};

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const isZip = (zip: string) => {
  return /^\d+$/.test(zip) && zip.length >= 5;
};

// Takes a date string in the format 'YYYY-MM-DD'
// and returns it in the format 'MM-DD-YYYY'.
export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${month}-${day}-${year}`;
};

export function checkHasPermission(subset: Permission[], superset: Permission[]) {
  return subset.every((permission) => superset.includes(permission));
}
