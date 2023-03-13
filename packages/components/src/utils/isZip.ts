export const isZip = (zip: string) => {
  return /^\d+$/.test(zip) && zip.length >= 5;
};
