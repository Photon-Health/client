import { Component, mergeProps, Show } from 'solid-js';
import { Icon, Spinner } from '../../index';
import Tooltip from '../Tooltip';
import { IconName, IconSize } from '../Icon';

interface IconButtonProps {
  onClick: () => void;
  iconName: IconName;
  iconSize?: IconSize;
  label: string;
  disabled?: boolean;
  loading?: boolean;
}

export const IconButton: Component<IconButtonProps> = (props) => {
  const merged = mergeProps({ size: 'md' }, props);
  console.log('merged', merged);
  const button = (
    <button
      class="text-gray-700 hover:text-gray-900 hover:bg-blue-50 rounded-md p-2 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-700 disabled:cursor-not-allowed"
      type="button"
      aria-label={props.label}
      onClick={() => {
        if (props.loading) {
          // I want to maintain the style of loading, not to grey out the button
          return;
        }
        props.onClick();
      }}
      disabled={props.disabled}
    >
      <Show when={!props.loading}>
        <Icon name={props.iconName} size={merged.iconSize} />
      </Show>
      <Show when={props.loading}>
        <Spinner size={merged.iconSize} />
      </Show>
    </button>
  );

  return <>{props.disabled ? button : <Tooltip text={props.label}>{button}</Tooltip>}</>;
};
