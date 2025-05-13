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

export const identityConstraint: RoutingConstraint = {
  prescription: {
    id: '',
    prescribable_name: ''
  },
  routing_constraint_type: 'exclude',
  constraint_pharmacies: []
};

function convertFromNoRouting(rc: RoutingConstraint): RoutingConstraint {
  if (rc.routing_constraint_type === 'no_routing') {
    return {
      prescription: rc.prescription,
      constraint_pharmacies: [],
      routing_constraint_type: 'include'
    };
  } else {
    return rc;
  }
}

function convertFromNoAdvice(rc: RoutingConstraint): RoutingConstraint {
  if (rc.routing_constraint_type === 'no_advice') {
    return {
      prescription: rc.prescription,
      constraint_pharmacies: [],
      routing_constraint_type: 'exclude'
    };
  } else {
    return rc;
  }
}

export function combineRoutingConstraints(
  rc1: RoutingConstraint,
  rc2: RoutingConstraint
): RoutingConstraint {
  rc1 = convertFromNoRouting(rc1);
  rc1 = convertFromNoAdvice(rc1);
  rc2 = convertFromNoRouting(rc2);
  rc2 = convertFromNoAdvice(rc2);

  const createPharmacyIdSet = (rc: RoutingConstraint): Set<string> => {
    const pharmacyIds = rc.constraint_pharmacies?.map((pharmacy) => {
      return pharmacy.id;
    });
    return new Set(pharmacyIds);
  };
  const rc1PharmacyIds = createPharmacyIdSet(rc1);
  const rc2PharmacyIds = createPharmacyIdSet(rc2);

  const pharmacyMap = new Map();
  for (const pharmacy of rc1?.constraint_pharmacies || []) {
    pharmacyMap.set(pharmacy.id, pharmacy);
  }
  for (const pharmacy of rc2?.constraint_pharmacies || []) {
    pharmacyMap.set(pharmacy.id, pharmacy);
  }

  const getPharmaciesIntersection = (idSet1: Set<string>, idSet2: Set<string>) => {
    const pharmacies = [];
    for (const id of Array.from(idSet2)) {
      if (idSet1.has(id)) {
        pharmacies.push(pharmacyMap.get(id));
      }
    }
    return pharmacies;
  };

  const getPharmaciesUnion = (idSet1: Set<string>, idSet2: Set<string>) => {
    const pharmacies = Array.from(idSet1).map((id) => pharmacyMap.get(id));
    for (const id of Array.from(idSet2)) {
      if (!idSet1.has(id)) {
        pharmacies.push(pharmacyMap.get(id));
      }
    }
    return pharmacies;
  };

  const getPharmaciesDifference = (idSet1: Set<string>, idSet2: Set<string>) => {
    const pharmacies = [];
    for (const id of Array.from(idSet1)) {
      if (!idSet2.has(id)) {
        pharmacies.push(pharmacyMap.get(id));
      }
    }
    return pharmacies;
  };

  if (rc1.routing_constraint_type === 'include' && rc2.routing_constraint_type === 'include') {
    return {
      prescription: { id: '', prescribable_name: '' },
      constraint_pharmacies: getPharmaciesIntersection(rc1PharmacyIds, rc2PharmacyIds),
      routing_constraint_type: 'include'
    };
  } else if (
    rc1.routing_constraint_type === 'include' &&
    rc2.routing_constraint_type === 'exclude'
  ) {
    return {
      prescription: { id: '', prescribable_name: '' },
      constraint_pharmacies: getPharmaciesDifference(rc1PharmacyIds, rc2PharmacyIds),
      routing_constraint_type: 'include'
    };
  } else if (
    rc1.routing_constraint_type === 'exclude' &&
    rc2.routing_constraint_type === 'include'
  ) {
    return {
      prescription: { id: '', prescribable_name: '' },
      constraint_pharmacies: getPharmaciesDifference(rc2PharmacyIds, rc1PharmacyIds),
      routing_constraint_type: 'include'
    };
  } else {
    // rc1 and rc2 are type exclude
    return {
      prescription: { id: '', prescribable_name: '' },
      constraint_pharmacies: getPharmaciesUnion(rc1PharmacyIds, rc2PharmacyIds),
      routing_constraint_type: 'exclude'
    };
  }
}

export function combineAllRoutingConstraints(
  routingConstraints: RoutingConstraint[],
  filters: RoutingConstraintType[] = ['include', 'exclude', 'no_advice', 'no_routing']
): RoutingConstraint {
  return routingConstraints.reduce((curCombination, curConstraint) => {
    return filters.includes(curConstraint.routing_constraint_type)
      ? combineRoutingConstraints(curCombination, curConstraint)
      : curCombination;
  }, identityConstraint);
}
