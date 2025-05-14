import {
  noAdviceConstraint,
  combineAllRoutingConstraints,
  combineRoutingConstraints,
  RoutingConstraint
} from './RoutingConstraint';

describe('combineRoutingConstraints', () => {
  it('intersects include lists when both routing constraints are type include', () => {
    const rc1: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx1', prescribable_name: 'Fake Rx 1' }],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        }
      ]
    };

    const rc2: RoutingConstraint = {
      prescriptions: [
        { id: 'fake_rx2', prescribable_name: 'Fake Rx 2' },
        { id: 'fake_rx3', prescribable_name: 'Fake Rx 3' }
      ],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        }
      ]
    };

    const combinedRc = combineRoutingConstraints(rc1, rc2);
    const expectedRc = {
      prescriptions: [
        { id: 'fake_rx1', prescribable_name: 'Fake Rx 1' },
        { id: 'fake_rx2', prescribable_name: 'Fake Rx 2' },
        { id: 'fake_rx3', prescribable_name: 'Fake Rx 3' }
      ],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        }
      ]
    };

    expect(combinedRc).toStrictEqual(expectedRc);
  });

  it('takes the set difference when the first routing constraint is type include and the second is type exclude', () => {
    const rc1: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx1', prescribable_name: 'Fake Rx 1' }],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        }
      ]
    };

    const rc2: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx2', prescribable_name: 'Fake Rx 2' }],
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        }
      ]
    };

    const combinedRc = combineRoutingConstraints(rc1, rc2);
    const expectedRc = {
      prescriptions: [
        { id: 'fake_rx1', prescribable_name: 'Fake Rx 1' },
        { id: 'fake_rx2', prescribable_name: 'Fake Rx 2' }
      ],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        }
      ]
    };

    expect(combinedRc).toStrictEqual(expectedRc);
  });

  it('takes the set difference when the first routing constraint is type exclude and the second is type include', () => {
    const rc1: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx1', prescribable_name: 'Fake Rx 1' }],
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        }
      ]
    };

    const rc2: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx2', prescribable_name: 'Fake Rx 2' }],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        }
      ]
    };

    const combinedRc = combineRoutingConstraints(rc1, rc2);
    const expectedRc = {
      prescriptions: [
        { id: 'fake_rx1', prescribable_name: 'Fake Rx 1' },
        { id: 'fake_rx2', prescribable_name: 'Fake Rx 2' }
      ],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        }
      ]
    };

    expect(combinedRc).toStrictEqual(expectedRc);
  });

  it('unions exclude lists when both routing constraints are type exclude', () => {
    const rc1: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx1', prescribable_name: 'Fake Rx 1' }],
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        }
      ]
    };

    const rc2: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx2', prescribable_name: 'Fake Rx 2' }],
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        }
      ]
    };

    const combinedRc = combineRoutingConstraints(rc1, rc2);
    const expectedRc = {
      prescriptions: [
        { id: 'fake_rx1', prescribable_name: 'Fake Rx 1' },
        { id: 'fake_rx2', prescribable_name: 'Fake Rx 2' }
      ],
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        }
      ]
    };

    expect(combinedRc).toStrictEqual(expectedRc);
  });

  it('combining an include list with the no_advice constraint returns the input include list (regardless of input order)', () => {
    const rc: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx1', prescribable_name: 'Fake Rx 1' }],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        }
      ]
    };

    const combinedRc1 = combineRoutingConstraints(rc, noAdviceConstraint);
    const combinedRc2 = combineRoutingConstraints(noAdviceConstraint, rc);
    expect(combinedRc1).toStrictEqual(rc);
    expect(combinedRc2).toStrictEqual(rc);
  });

  it('combining an exclude list with the no_advice constraint returns the input exlude list (regardless of input order)', () => {
    const rc: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx1', prescribable_name: 'Fake Rx 1' }],
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        }
      ]
    };

    const combinedRc1 = combineRoutingConstraints(rc, noAdviceConstraint);
    const combinedRc2 = combineRoutingConstraints(noAdviceConstraint, rc);
    expect(combinedRc1).toStrictEqual(rc);
    expect(combinedRc2).toStrictEqual(rc);
  });
});

describe('combineAllRoutingConstraints', () => {
  it('rolls up all routing constraints', () => {
    const rc1: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx1', prescribable_name: 'Fake Rx 1' }],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        },
        {
          id: 'fake_id4',
          name: 'Fake Pharmacy 4'
        },
        {
          id: 'fake_id5',
          name: 'Fake Pharmacy 5'
        }
      ]
    };

    const rc2: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx2', prescribable_name: 'Fake Rx 2' }],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        },
        {
          id: 'fake_id4',
          name: 'Fake Pharmacy 4'
        },
        {
          id: 'fake_id5',
          name: 'Fake Pharmacy 5'
        },
        {
          id: 'fake_id6',
          name: 'Fake Pharmacy 6'
        }
      ]
    };

    const rc3: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx3', prescribable_name: 'Fake Rx 3' }],
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id5',
          name: 'Fake Pharmacy 5'
        }
      ]
    };

    const rc4: RoutingConstraint = {
      prescriptions: [{ id: 'fake_rx4', prescribable_name: 'Fake Rx 4' }],
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id6',
          name: 'Fake Pharmacy 6'
        }
      ]
    };

    const rc5: RoutingConstraint = {
      prescriptions: [
        { id: 'fake_rx5', prescribable_name: 'Fake Rx 5' },
        { id: 'fake_rx6', prescribable_name: 'Fake Rx 6' }
      ],
      routing_constraint_type: 'no_advice'
    };

    const combinedRc = combineAllRoutingConstraints([rc1, rc2, rc3, rc4, rc5]);
    const expectedRc = {
      prescriptions: [
        { id: 'fake_rx1', prescribable_name: 'Fake Rx 1' },
        { id: 'fake_rx2', prescribable_name: 'Fake Rx 2' },
        { id: 'fake_rx3', prescribable_name: 'Fake Rx 3' },
        { id: 'fake_rx4', prescribable_name: 'Fake Rx 4' },
        { id: 'fake_rx5', prescribable_name: 'Fake Rx 5' },
        { id: 'fake_rx6', prescribable_name: 'Fake Rx 6' }
      ],
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        },
        {
          id: 'fake_id4',
          name: 'Fake Pharmacy 4'
        }
      ]
    };

    expect(combinedRc).toStrictEqual(expectedRc);
  });

  it('combining an empty array returns the no_advice constraint', () => {
    const combinedRc = combineAllRoutingConstraints([]);
    expect(combinedRc).toStrictEqual(noAdviceConstraint);
  });
});
