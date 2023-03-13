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
