import { createSignal, JSXElement, onMount, Show } from 'solid-js';
import Icon from '../Icon';

export type BannerProps = {
  children: JSXElement;
  status: 'success' | 'info';
  withoutIcon?: boolean;
  closable?: boolean;
  id?: string;
};

export default function Banner(props: BannerProps) {
  const [isVisible, setIsVisible] = createSignal(true);

  onMount(() => {
    const storedState = sessionStorage.getItem(`banner-${props.id}`);
    if (storedState === 'closed') {
      setIsVisible(false);
    }
  });

  const closeBanner = () => {
    setIsVisible(false);
    if (props.id) {
      sessionStorage.setItem(`banner-${props.id}`, 'closed');
    }
  };

  return (
    <Show when={isVisible()}>
      <div class="text-blue-600 flex items-start justify-between gap-2 bg-blue-50 py-3 px-3 sm:px-4 rounded-lg">
        <div class="flex items-center w-full">
          <Show when={!props.withoutIcon}>
            <div class="flex-shrink-0 mr-2">
              <Icon name="informationCircle" size="sm" />
            </div>
          </Show>
          {props.children}
        </div>
        <Show when={props.closable}>
          <button type="button" onClick={closeBanner} class="ml-auto text-blue-600" title="Close">
            <Icon name="xMark" size="sm" />
          </button>
        </Show>
      </div>
    </Show>
  );
}
