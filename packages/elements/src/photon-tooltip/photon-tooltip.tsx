//Shoelace
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import { mergeProps } from 'solid-js';

export type TooltipPlacements =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';
export type PhotonTooltipProps = {
  tip: string;
  placement?: TooltipPlacements;
  maxWidth?: string;
};

export const PhotonTooltip = (p: PhotonTooltipProps) => {
  const props = mergeProps({ placement: 'top', maxWidth: '200px' }, p);
  return (
    <>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <sl-tooltip
        content={props.tip}
        placement={props.placement}
        style={{ '--max-width': props.maxWidth }}
      >
        <sl-icon name="info-circle" />
      </sl-tooltip>
    </>
  );
};

export default PhotonTooltip;
