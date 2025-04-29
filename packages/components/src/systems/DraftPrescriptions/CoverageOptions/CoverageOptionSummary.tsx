import { CoverageOption } from '../../PrescribeProvider';
import { Banner } from '../../../index';
import { createMemo, For } from 'solid-js';
import { BannerStatus } from '../../../particles/Banner';

export type CoverageOptionSummaryProps = {
  coverageOption: CoverageOption;
};

export function CoverageOptionSummary(props: CoverageOptionSummaryProps) {
  const bannerStatus = createMemo<BannerStatus>(() => {
    if (props.coverageOption.status === 'COVERED') {
      if (props.coverageOption.paRequired) {
        return 'warning';
      }

      return 'success';
    }

    if (props.coverageOption.status === 'COVERED_WITH_RESTRICTIONS') {
      return 'warning';
    }

    return 'error';
  });

  const bannerMessage = createMemo<string>(() => {
    if (props.coverageOption.status === 'COVERED') {
      if (props.coverageOption.paRequired) {
        return 'PA Required';
      }

      return 'Covered by Insurance';
    }

    if (props.coverageOption.status === 'COVERED_WITH_RESTRICTIONS') {
      return props.coverageOption.statusMessage;
    }

    return 'Not Covered';
  });

  return (
    <>
      <div class="flex flex-col">
        <div class="text-xs text-gray-500">
          Quantity / Days Supply:
          <b>
            {props.coverageOption.dispenseQuantity} {props.coverageOption.dispenseUnit} /{' '}
            {props.coverageOption.daysSupply} d/s
          </b>
        </div>
        {/*<div class="text-xs text-gray-500">*/}
        {/*  Plan Pays: <b>${props.coverageOption.planPays}</b>*/}
        {/*</div>*/}
        <div class="text-xs text-gray-500">
          Pharmacy: <b>Patient's Preferred</b>
        </div>
      </div>
      <Banner status={bannerStatus()} withoutIcon={true}>
        <div class="flex justify-between w-full">
          <div class="text-xs">
            <b>{bannerMessage()}</b>
          </div>
          <div class="text-xs">
            Est. Copay: <b>{presentPrice(props.coverageOption.price)}</b>
          </div>
        </div>
      </Banner>
      <For each={props.coverageOption.alerts}>
        {(alert) => (
          <>
            <div>Label: {alert.label}</div>
            <div>Name: {alert.name}</div>
          </>
        )}
      </For>
    </>
  );
}

function presentPrice(price: number | null): string {
  return price ? `$${price.toFixed(2)}` : 'N/A';
}
