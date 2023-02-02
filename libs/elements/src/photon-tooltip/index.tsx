//Shoelace
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';

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
};

const PhotonTooltip = ({ tip, placement = 'top' }: PhotonTooltipProps) => {
  return (
    <>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <sl-tooltip content={tip} placement={placement} style="--max-width: 200px;">
        <sl-icon name="info-circle"></sl-icon>
      </sl-tooltip>
    </>
  );
};

export default PhotonTooltip;
