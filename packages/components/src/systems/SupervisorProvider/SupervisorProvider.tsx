import {
  Accessor,
  createContext,
  createEffect,
  createResource,
  createSignal,
  JSXElement,
  useContext
} from 'solid-js';
import { CreateSupervisorMutation, PhotonClient, SupervisorCardQuery } from '@photonhealth/sdk';
import {
  SupervisorCardFragment,
  SupervisorInput
} from '@photonhealth/sdk/dist/clinical-api/types';
import { usePhotonClient } from '../SDKProvider';
import { usePrescribeEventDispatch } from '../PrescribeEventDispatchProvider';

export type NewSupervisorInput = Pick<SupervisorInput, 'firstName' | 'lastName' | 'npi'>;

export interface SupervisorContextType {
  supervisorId: Accessor<string | undefined>;
  setSupervisorId: (id: string | undefined) => void;
  supervisors: Accessor<SupervisorCardFragment[]>;
  hasMostRecentSupervisor: Accessor<boolean>;
  createSupervisor: (input: NewSupervisorInput) => Promise<SupervisorCardFragment | undefined>;
  loading: Accessor<boolean>;
}

const SupervisorContext = createContext<SupervisorContextType>();

interface SupervisorProviderProps {
  children: JSXElement;
  supervisor?: string;
}

type SupervisorPrefillResult = { id?: string; errors?: string[] };

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

const sortSupervisors = (supervisors: SupervisorCardFragment[]) =>
  [...supervisors].sort(
    (a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
  );

export const SupervisorProvider = (props: SupervisorProviderProps) => {
  const client = usePhotonClient();
  const { dispatchSupervisorError } = usePrescribeEventDispatch();

  const [supervisorId, setSupervisorId] = createSignal<string | undefined>(undefined);
  const [supervisors, setSupervisors] = createSignal<SupervisorCardFragment[]>([]);
  const [hasMostRecentSupervisor, setHasMostRecentSupervisor] = createSignal(false);

  // Prefill: JSON prop → CreateSupervisor mutation → id.
  const [prefillResource] = createResource(
    () => props.supervisor || null,
    (raw) => createSupervisorFetch(client, raw)
  );

  // Seed the selection when the JSON prefill resolves. Guarded on a truthy id
  // so a user clearing the combobox isn't clobbered.
  createEffect(() => {
    const id = prefillResource()?.id;
    if (id) setSupervisorId(id);
  });

  createEffect(() => {
    const errs = prefillResource()?.errors;
    if (errs && errs.length > 0) {
      dispatchSupervisorError(errs);
    }
  });

  // Supervisor list + most-recent auto-select.
  const [listResource] = createResource(async () => {
    const { data } = await client.apolloClinical.query({
      query: SupervisorCardQuery,
      // No variables, so the cache can't tell when to refetch.
      fetchPolicy: 'network-only'
    });
    return data;
  });

  createEffect(() => {
    const data = listResource();
    if (!data) return;
    setSupervisors(
      sortSupervisors(data.supervisors.filter((s): s is SupervisorCardFragment => !!s))
    );
    if (data.mostRecentSupervisor) {
      setSupervisorId(data.mostRecentSupervisor.id);
      setHasMostRecentSupervisor(true);
    }
  });

  const createSupervisor = async (
    input: NewSupervisorInput
  ): Promise<SupervisorCardFragment | undefined> => {
    try {
      const { data } = await client.apolloClinical.mutate({
        mutation: CreateSupervisorMutation,
        variables: input
      });
      const supervisor = data?.createSupervisor;
      if (!supervisor) return undefined;
      setSupervisors((prev) => sortSupervisors([...prev, supervisor]));
      setSupervisorId(supervisor.id);
      return supervisor;
    } catch {
      return undefined;
    }
  };

  const value: SupervisorContextType = {
    supervisorId,
    setSupervisorId,
    supervisors,
    hasMostRecentSupervisor,
    createSupervisor,
    loading: () => prefillResource.loading || listResource.loading
  };

  return <SupervisorContext.Provider value={value}>{props.children}</SupervisorContext.Provider>;
};

export const createSupervisorFetch = async (
  client: PhotonClient,
  raw: string
): Promise<SupervisorPrefillResult> => {
  let parsed: Partial<SupervisorInput>;
  try {
    parsed = JSON.parse(raw) as Partial<SupervisorInput>;
  } catch {
    return { errors: ['Invalid supervisor json passed in'] };
  }

  if (!hasRequiredFields(parsed)) {
    // TODO: Add missing fields to error message
    return { errors: ['Missing required fields'] };
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
