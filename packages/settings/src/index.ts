import { boson } from './lib/boson';
import { neutron } from './lib/neutron';
import { photon } from './lib/photon';

export function getSettings(environment: 'boson' | 'neutron' | 'photon') {
  switch (environment) {
    case 'boson':
      return boson;
    case 'neutron':
      return neutron;
    case 'photon':
      return photon;
    default:
      throw new Error(`Invalid environment: ${environment}`);
  }
}
