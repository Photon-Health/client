import { createEffect, createMemo } from 'solid-js';
import Banner, { BannerStatus } from '../../particles/Banner';
import { Prescription } from '@photonhealth/sdk/dist/types';
import { RoutingConstraint, RoutingConstraintType } from './RoutingConstraint';

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

const validTypes: RoutingConstraintType[] = ['include', 'no_routing'];

export const PrescriptionRoutingAlert = (props: {
  prescription: Prescription;
  routingConstraint: RoutingConstraint;
}) => {
  createEffect(() => {
    if (!validTypes.includes(props.routingConstraint.routing_constraint_type)) {
      throw new Error('Invalid RoutingConstraintType for PrescriptionRoutingAlert');
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
