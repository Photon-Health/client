import { Component, mergeProps } from 'solid-js';
import { Icon } from '../../index';
import Tooltip from '../Tooltip';
import { IconName, IconSize } from '../Icon';

interface IconButtonProps {
  onClick: () => void;
  iconName: IconName;
  iconSize?: IconSize;
  label: string;
  disabled?: boolean;
}

export const IconButton: Component<IconButtonProps> = (props) => {
  const merged = mergeProps({ size: 'md' }, props);
  const button = (
    <button
      class="text-gray-700 hover:text-gray-900 hover:bg-blue-50 rounded-md p-2 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-700 disabled:cursor-not-allowed"
      type="button"
      aria-label={props.label}
      onClick={() => props.onClick()}
      disabled={props.disabled}
    >
      <Icon name={props.iconName} size={merged.iconSize} />
    </button>
  );

  return <>{props.disabled ? button : <Tooltip text={props.label}>{button}</Tooltip>}</>;
};
