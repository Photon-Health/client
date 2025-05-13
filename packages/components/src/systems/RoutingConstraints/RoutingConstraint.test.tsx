import {
  combineAllRoutingConstraints,
  combineRoutingConstraints,
  RoutingConstraint
} from './RoutingConstraint';

describe('combineRoutingConstraints', () => {
  it('appends include lists when both routing constraints are type include', () => {
    const rc1: RoutingConstraint = {
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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
        }
      ]
    };

    expect(combinedRc).toStrictEqual(expectedRc);
  });

  it('takes the set difference when the first routing constraint is type include and the second is type exclude', () => {
    const rc1: RoutingConstraint = {
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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

  it('appends exclude lists when both routing constraints are type exclude', () => {
    const rc1: RoutingConstraint = {
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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
      prescription: { id: '', prescribable_name: '' },
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
});

describe('combineAllRoutingConstraints', () => {
  it('rolls up all routing constraints', () => {
    const rc1: RoutingConstraint = {
      prescription: { id: '', prescribable_name: '' },
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
        }
      ]
    };

    const rc2: RoutingConstraint = {
      prescription: { id: '', prescribable_name: '' },
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id4',
          name: 'Fake Pharmacy 4'
        }
      ]
    };

    const rc3: RoutingConstraint = {
      prescription: { id: '', prescribable_name: '' },
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id1',
          name: 'Fake Pharmacy 1'
        },
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 5'
        }
      ]
    };

    const rc4: RoutingConstraint = {
      prescription: { id: '', prescribable_name: '' },
      routing_constraint_type: 'exclude',
      constraint_pharmacies: [
        {
          id: 'fake_id3',
          name: 'Fake Pharmacy 3'
        },
        {
          id: 'fake_id6',
          name: 'Fake Pharmacy 6'
        }
      ]
    };

    const rc5: RoutingConstraint = {
      prescription: { id: '', prescribable_name: '' },
      routing_constraint_type: 'no_advice'
    };

    const combinedRc = combineAllRoutingConstraints([rc1, rc2, rc3, rc4, rc5]);
    const expectedRc = {
      prescription: { id: '', prescribable_name: '' },
      routing_constraint_type: 'include',
      constraint_pharmacies: [
        {
          id: 'fake_id2',
          name: 'Fake Pharmacy 2'
        },
        {
          id: 'fake_id4',
          name: 'Fake Pharmacy 4'
        }
      ]
    };

    expect(combinedRc).toStrictEqual(expectedRc);
  });
});
