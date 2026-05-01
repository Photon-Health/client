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
  if (!searchParams) return false;
  const parsedParams = queryString.parse(searchParams);
  // if photon is not present, then these are auth params for a different Auth0 instance so we should ignore them
  return (
    'state' in parsedParams &&
    'photon' in parsedParams &&
    ('code' in parsedParams || 'error' in parsedParams)
  );
};

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const isZip = (zip: string) => {
  return /^\d{5}(-\d{4})?$/.test(zip);
};

export function checkHasPermission(subset: Permission[], superset: Permission[]) {
  return subset.every((permission) => superset.includes(permission));
}
