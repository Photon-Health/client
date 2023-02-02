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

const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const ERROR_RE = /[?&]error=[^&]+/;

export const hasAuthParams = (searchParams = window.location.search): boolean =>
  (CODE_RE.test(searchParams) || ERROR_RE.test(searchParams)) && STATE_RE.test(searchParams);

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const isZip = (zip: string) => {
  return /^\d+$/.test(zip) && zip.length >= 5;
};
