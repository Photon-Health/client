import { boson } from './lib/boson';
import { neutron } from './lib/neutron';
import { photon } from './lib/photon';

const environment = process.env['REACT_APP_ENV_NAME'] as 'boson' | 'neutron' | 'photon' | 'tau';

export function getOrgMailOrderPharms(organizationId: string | undefined) {
  switch (environment) {
    case 'tau':
    case 'boson':
      return boson(organizationId);
    case 'neutron':
      return neutron(organizationId);
    case 'photon':
      return photon(organizationId);
    default:
      throw new Error(`Invalid environment: ${environment}`);
  }
}
