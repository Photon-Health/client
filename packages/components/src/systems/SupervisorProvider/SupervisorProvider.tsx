import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createResource,
  JSXElement,
  useContext
} from 'solid-js';
import { CreateSupervisorMutation, PhotonClient } from '@photonhealth/sdk';
import { SupervisorInput } from '@photonhealth/sdk/dist/clinical-api/types';
import { usePhotonClient } from '../SDKProvider';
import { usePrescribeEventDispatch } from '../PrescribeEventDispatchProvider';

export interface SupervisorContextType {
  supervisorId: Accessor<string | undefined>;
  loading: Accessor<boolean>;
}

const SupervisorContext = createContext<SupervisorContextType>();

interface SupervisorProviderProps {
  children: JSXElement;
  supervisor?: string;
}

type SupervisorResult = { id?: string; errors?: string[] };

const hasRequiredFields = (s: Partial<SupervisorInput>) =>
  Boolean(
    s.firstName &&
      s.lastName &&
      s.npi &&
      s.phone &&
      s.address &&
      s.address.street1 &&
      s.address.city &&
      s.address.state &&
      s.address.postalCode
  );

export const SupervisorProvider = (props: SupervisorProviderProps) => {
  const client = usePhotonClient();
  const { dispatchSupervisorError } = usePrescribeEventDispatch();

  const [resource] = createResource(
    () => props.supervisor || null,
    (raw) => createSupervisorFetch(client, raw)
  );

  const supervisorId = createMemo(() => resource()?.id);

  createEffect(() => {
    const errs = resource()?.errors;
    if (errs && errs.length > 0) {
      dispatchSupervisorError(errs);
    }
  });

  const value: SupervisorContextType = {
    supervisorId,
    loading: () => resource.loading
  };

  return <SupervisorContext.Provider value={value}>{props.children}</SupervisorContext.Provider>;
};

export const createSupervisorFetch = async (
  client: PhotonClient,
  raw: string
): Promise<SupervisorResult> => {
  let parsed: Partial<SupervisorInput>;
  try {
    parsed = JSON.parse(raw) as Partial<SupervisorInput>;
  } catch {
    return { errors: ['Invalid supervisor json passed in'] };
  }

  if (!hasRequiredFields(parsed)) {
    return { errors: ['Missing required supervisor fields'] };
  }

  try {
    const result = await client.apolloClinical.mutate({
      mutation: CreateSupervisorMutation,
      variables: {
        firstName: parsed.firstName!,
        lastName: parsed.lastName!,
        npi: parsed.npi!,
        phone: parsed.phone!,
        address: parsed.address!
      }
    });
    if (result.errors?.length) {
      return { errors: [result.errors[0].message] };
    }
    if (!result.data) {
      return { errors: ['Supervisor creation failed'] };
    }
    return { id: result.data.createSupervisor.id };
  } catch (e) {
    return { errors: [(e as Error).message] };
  }
};

export const useSupervisor = () => {
  const context = useContext(SupervisorContext);
  if (!context) {
    throw new Error('useSupervisor must be used within SupervisorProvider');
  }
  return context;
};
