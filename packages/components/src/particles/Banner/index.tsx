import { createSignal, JSXElement, onMount, Show } from 'solid-js';
import Icon, { IconName } from '../Icon';
import clsx from 'clsx';

export type BannerStatus = 'success' | 'info' | 'warning' | 'error' | 'suggestion';

export type BannerProps = {
  children: JSXElement;
  status: BannerStatus;
  iconName?: IconName;
  withoutIcon?: boolean;
  withBorder?: boolean;
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

  const bannerClasses = () => {
    return clsx('flex place-items-start justify-between gap-2 py-3 px-3 sm:px-4 rounded-lg', {
      'border-2 rounded border-solid': props.withBorder,
      'text-blue-600 bg-blue-50': props.status === 'info',
      'border-blue-600': props.status === 'info' && props.withBorder,
      'text-red-600 bg-red-50': props.status === 'error',
      'border-red-600': props.status === 'error' && props.withBorder,
      'text-green-600 bg-green-50': props.status === 'success',
      'border-green-600': props.status === 'success' && props.withBorder,
      'text-yellow-600 bg-yellow-50': props.status === 'warning',
      'border-yellow-600': props.status === 'warning' && props.withBorder,
      'text-slate-600 bg-slate-50': props.status === 'suggestion',
      'border-slate-600': props.status === 'suggestion' && props.withBorder
    });
  };

  const iconClasses = () => {
    return clsx('', {
      'text-blue-600': props.status === 'info',
      'text-red-600': props.status === 'error',
      'text-green-600': props.status === 'success',
      'text-yellow-600': props.status === 'warning',
      'text-slate-600': props.status === 'suggestion'
    });
  };

  return (
    <Show when={isVisible()}>
      <div class={bannerClasses()}>
        <div class="flex w-full">
          <Show when={!props.withoutIcon}>
            <div class="flex-shrink-0 mr-2">
              <Icon
                name={!props.iconName ? 'informationCircle' : props.iconName}
                class={iconClasses()}
              />
            </div>
          </Show>
          {props.children}
        </div>
        <Show when={props.closable}>
          <button
            type="button"
            onClick={closeBanner}
            class={'ml-auto ' + iconClasses()}
            title="Close"
          >
            <Icon name="xMark" size="sm" />
          </button>
        </Show>
      </div>
    </Show>
  );
}
