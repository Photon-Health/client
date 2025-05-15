import { createEffect, createMemo } from 'solid-js';
import Banner, { BannerStatus } from '../../particles/Banner';
import { Prescription } from '@photonhealth/sdk/dist/types';
import { isValidPrescriptionRoutingConstraint, RoutingConstraint } from './RoutingConstraint';

const getStatus = (numValidPharmacies: number): BannerStatus => {
  if (numValidPharmacies <= 0) {
    return 'error';
  } else {
    return 'warning';
  }
};

const getConstraintPharmaciesString = (
  routingConstraint: RoutingConstraint,
  numValidPharmacies: number
): string => {
  if (!routingConstraint.constraint_pharmacies || numValidPharmacies === 0) {
    return '';
  }

  const pharmacyNames = routingConstraint.constraint_pharmacies.map((pharmacy) => pharmacy.name);
  if (numValidPharmacies === 1) {
    return pharmacyNames[0];
  }

  pharmacyNames[numValidPharmacies - 1] = `and ${pharmacyNames[numValidPharmacies - 1]}`;
  if (numValidPharmacies === 2) {
    return pharmacyNames.join(' ');
  }

  return pharmacyNames.join(', ');
};

const getMessage = (
  prescription: Prescription,
  routingConstraint: RoutingConstraint,
  numValidPharmacies: number
): string => {
  if (numValidPharmacies <= 0) {
    return `${prescription.treatment.name} cannot be filled at any pharmacies.`;
  } else {
    return `${prescription.treatment.name} can only be filled at ${getConstraintPharmaciesString(
      routingConstraint,
      numValidPharmacies
    )}.`;
  }
};

export const PrescriptionRoutingAlert = (props: {
  prescription: Prescription;
  routingConstraint: RoutingConstraint;
}) => {
  createEffect(() => {
    if (!isValidPrescriptionRoutingConstraint(props.routingConstraint)) {
      throw new Error('Cannot create a PrescriptionRoutingAlert for the given routing constraint.');
    }

    if (props.routingConstraint.prescriptions[0].id !== props.prescription.id) {
      throw new Error(
        `Prescription ID ${props.prescription.id} and the constraint's prescription ID ${props.routingConstraint.prescriptions[0].id} do not match.`
      );
    }
  });

  const numValidPharmacies = createMemo((): number => {
    if (
      props.routingConstraint.routing_constraint_type === 'no_routing' ||
      !props.routingConstraint.constraint_pharmacies
    ) {
      return 0;
    } else {
      return props.routingConstraint.constraint_pharmacies.length;
    }
  });

  return (
    <Banner iconName="exclamationTriangle" status={getStatus(numValidPharmacies())} withBorder>
      {getMessage(props.prescription, props.routingConstraint, numValidPharmacies())}
    </Banner>
  );
};
