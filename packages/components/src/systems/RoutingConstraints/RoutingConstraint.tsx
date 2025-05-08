import { Prescription } from '@photonhealth/sdk/dist/types';

export interface RoutingConstraint {
  prescription: {
    id: string;
    prescribable_name: string;
  };
  routing_constraint_type: RoutingConstraintType;
  constraint_pharmacies?: {
    id: string;
    name: string;
  }[];
}

export type RoutingConstraintType = 'include' | 'exclude' | 'no_routing' | 'no_advice';

export function getRoutingConstraint(prescription: Prescription): RoutingConstraint {
  // TODO: make request to get routing constraints
  // const { data } = await clinicalClient.query(...)
  // for now this is hard-coded to handle Zepbound edge cases

  const validZepboundVialPackages = ['00002015204', '00002024304', '00002121404', '00002134004'];
  const invalidZepboundVialProducts = [
    '000021423',
    '000021214',
    '000022002',
    '000020152',
    '000021340',
    '000020243'
  ];
  const zepboundAutoInjectorPackages = [
    '00002246001',
    '00002246080',
    '00002250601',
    '00002250661',
    '00002250680',
    '00002247101',
    '00002247180',
    '00002245701',
    '00002245780',
    '00002249501',
    '00002249580',
    '00002248401',
    '00002248480'
  ];
  const zepboundAutoInjectorProducts = [
    '000022457',
    '000022460',
    '000022484',
    '000022495',
    '000022506',
    '000022471'
  ];

  const packageNDC = prescription.treatment?.codes?.packageNDC?.replaceAll('-', '');
  const productNDC =
    prescription.treatment?.codes?.productNDC?.replaceAll('-', '') ||
    packageNDC?.substring(0, packageNDC?.length - 2);

  if (!packageNDC || !productNDC) {
    return {
      prescription: {
        id: prescription.id,
        prescribable_name: prescription.treatment.name
      },
      routing_constraint_type: 'no_advice'
    };
  }

  if (validZepboundVialPackages.includes(packageNDC)) {
    return {
      prescription: {
        id: prescription.id,
        prescribable_name: prescription.treatment.name
      },
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'phr_01J6APWHGNFJCE74SB031VYPHW',
          name: 'LillyDirect Self Pay Pharmacy Solutions'
        }
      ]
    };
  } else if (invalidZepboundVialProducts.includes(productNDC)) {
    return {
      prescription: {
        id: prescription.id,
        prescribable_name: prescription.treatment.name
      },
      routing_constraint_type: 'no_routing'
    };
  } else if (
    zepboundAutoInjectorPackages.includes(packageNDC) ||
    zepboundAutoInjectorProducts.includes(productNDC)
  ) {
    return {
      prescription: {
        id: prescription.id,
        prescribable_name: prescription.treatment.name
      },
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'phr_01J6APWHGNFJCE74SB031VYPHW',
          name: 'LillyDirect Self Pay Pharmacy Solutions'
        }
      ]
    };
  } else {
    return {
      prescription: {
        id: prescription.id,
        prescribable_name: prescription.treatment.name
      },
      routing_constraint_type: 'no_advice'
    };
  }
}

export function getPrescriptionRoutingConstraints(
  routingConstraints: RoutingConstraint[]
): Map<string, RoutingConstraint> {
  const map = new Map<string, RoutingConstraint>();
  for (const constraint of routingConstraints) {
    if (
      constraint.routing_constraint_type === 'include' ||
      constraint.routing_constraint_type === 'no_routing'
    ) {
      map.set(constraint.prescription.id, constraint);
    }
  }
  return map;
}
