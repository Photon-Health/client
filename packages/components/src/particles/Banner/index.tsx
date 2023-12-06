import { Show, JSXElement } from 'solid-js';
import Icon from '../Icon';

export type BannerProps = {
  children: JSXElement;
  status: 'success' | 'info';
  withoutIcon?: boolean;
};

export default function Banner(props: BannerProps) {
  return (
    <div class="text-blue-600 flex items-center gap-2 bg-blue-50 py-3 px-3 sm:px-4 rounded-lg">
      <Show when={!props.withoutIcon}>
        <div class="flex-shrink-0">
          <Icon name="informationCircle" size="sm" />
        </div>
      </Show>
      {props.children}
    </div>
  );
}
