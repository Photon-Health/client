import { Prescription } from '@photonhealth/sdk/dist/types';

type PrescriptionDetails = Pick<
  Prescription,
  'dispenseQuantity' | 'dispenseUnit' | 'daysSupply' | 'instructions' | 'fillsAllowed'
>;

export function formatPrescriptionDetails(prescription?: PrescriptionDetails) {
  let dispenseQuantity = 'N/A';
  let dispenseUnit = '';
  let daysSupply = 'N/A';
  let refills = 'N/A';
  let instructions = 'N/A';

  if (prescription) {
    dispenseQuantity = prescription.dispenseQuantity.toString();
    if (prescription.dispenseQuantity > 0) {
      dispenseUnit = ` ${prescription.dispenseUnit}`;
    }

    if (prescription.daysSupply) {
      daysSupply = prescription.daysSupply.toString();
    }

    if (prescription.fillsAllowed) {
      refills = (prescription.fillsAllowed - 1).toString();
    } else {
      refills = '0';
    }

    if (prescription.instructions) {
      instructions = prescription.instructions;
    }
  }

  return `QTY: ${dispenseQuantity}${dispenseUnit} | Days Supply: ${daysSupply} | Refills: ${refills} | Sig: ${instructions}`;
}
