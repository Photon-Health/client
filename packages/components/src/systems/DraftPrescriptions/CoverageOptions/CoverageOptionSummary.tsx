import { CoverageOption } from '../../PrescribeProvider';
import { Banner } from '../../../index';
import { createMemo, For, Show } from 'solid-js';
import { BannerStatus } from '../../../particles/Banner';
import { Prescription } from '@photonhealth/sdk/dist/types';
import { getRefillsCount } from '../../../utils/formatRxString';

export type CoverageOptionSummaryProps = {
  coverageOption: CoverageOption;
  prescription?: Prescription;
};

export function CoverageOptionSummary(props: CoverageOptionSummaryProps) {
  const bannerData = createMemo<CoverageBannerData>(() => {
    if (props.coverageOption.paRequired) {
      return {
        status: 'warning',
        message: 'PA Required'
      };
    }

    if (props.coverageOption.status === 'COVERED') {
      return {
        status: 'success',
        message: 'Covered by Insurance'
      };
    }

    if (props.coverageOption.status === 'COVERED_WITH_RESTRICTIONS') {
      return {
        status: 'warning',
        message: 'Covered with Restrictions',
        subMessage: props.coverageOption.statusMessage
      };
    }

    return {
      status: 'error',
      message: 'Not Covered by Insurance',
      subMessage: props.coverageOption.statusMessage
    };
  });

  const usefulAlerts = createMemo(() =>
    props.coverageOption.alerts.filter((alert) => alert.text !== props.coverageOption.statusMessage)
  );

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-col">
        <div class="text-xs text-gray-500">
          <span>Quantity / Days Supply: </span>
          <span class="font-bold">
            {`${props.coverageOption.dispenseQuantity} ${props.coverageOption.dispenseUnit} / ${props.coverageOption.daysSupply}`}
          </span>
        </div>
        <Show when={props.prescription}>
          {(rx) => (
            <>
              <div class="text-xs text-gray-500">
                <span>Instructions: </span>
                <span>{rx().instructions}</span>
              </div>
              <div class="text-xs text-gray-500">
                <span>Refills: </span>
                <span>{getRefillsCount(rx().fillsAllowed)}</span>
              </div>
            </>
          )}
        </Show>
        <div class="text-xs text-gray-500">
          <span>Pharmacy: </span>
          <span class="font-bold">
            <Show when={props.prescription}>Patient's Preferred</Show>
            <Show when={!props.prescription}>{props.coverageOption.pharmacy.name}</Show>
          </span>
        </div>
      </div>
      <Banner status={bannerData().status} withoutIcon={true}>
        <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 md:gap-1 w-full">
          <div class="flex flex-col text-xs">
            <div class="font-bold">{bannerData().message}</div>
            <div>{bannerData().subMessage}</div>
          </div>
          <div class="text-xs text-left md:text-right whitespace-nowrap">
            <span>Est. Copay: </span>
            <span class="font-bold">{presentPrice(props.coverageOption.price)}</span>
          </div>
        </div>
      </Banner>
      <Show when={usefulAlerts().length > 0}>
        <div>Alerts</div>
        <ul>
          <For each={usefulAlerts()}>
            {(alert) => (
              <li class="text-xs">
                <span class="text-gray-600">{alert.label}: </span>
                <span class="text-gray-500">{alert.text}</span>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}

function presentPrice(price: number | null): string {
  return price ? `$${price.toFixed(0)}` : 'N/A';
}

type CoverageBannerData = {
  status: BannerStatus;
  message: string;
  subMessage?: string;
};
