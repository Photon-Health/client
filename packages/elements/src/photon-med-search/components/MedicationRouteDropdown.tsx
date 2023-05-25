import { SearchMedication } from '@photonhealth/sdk/dist/types';
import { createEffect, createSignal, untrack } from 'solid-js';
import { usePhoton } from '../../context';
import { PhotonDropdown } from '../../photon-dropdown';

export const MedicationRouteDropdown = (props: { disabled: boolean; medicationId: string }) => {
  const client = usePhoton();
  const [uid, setUid] = createSignal<string>();
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [setFilterText] = createSignal<string>('');
  const [data, setData] = createSignal<SearchMedication[]>([]);

  const dispatchRouteSelected = (id: string) => {
    const event = new CustomEvent('photon-route-selected', {
      composed: true,
      bubbles: true,
      detail: {
        routeId: id
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchRouteDeselected = () => {
    const event = new CustomEvent('photon-route-deselected', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  createEffect(async () => {
    actionRef.clear();
    if (props.medicationId.length > 0) {
      setIsLoading(true);
      untrack(async () => {
        const id = String(Math.random());
        setUid(id);
        const { data } = await client!.getSDK().clinical.searchMedication.getRoutes({
          id: props.medicationId
        });
        if (id === uid()) {
          setData(data.medicationRoutes ?? []);
        }
        setIsLoading(false);
      });
    }
  }, [props.medicationId]);

  const actionRef: any = {};

  let ref: any;

  return (
    <div
      class="w-full"
      ref={ref}
      on:photon-data-selected={(e: any) => {
        dispatchRouteSelected(e.detail.data.id);
      }}
      on:photon-data-unselected={() => {
        dispatchRouteDeselected();
      }}
    >
      <PhotonDropdown
        actionRef={actionRef}
        data={data()}
        label={'Route'}
        disabled={props.disabled}
        placeholder="Select a route..."
        isLoading={isLoading()}
        hasMore={false}
        displayAccessor={(p) => p?.name || ''}
        onSearchChange={async (s: string) => setFilterText(s)}
        onHide={async () => {
          setFilterText('');
        }}
        noDataMsg={'No routes found'}
        required={false}
      ></PhotonDropdown>
    </div>
  );
};
