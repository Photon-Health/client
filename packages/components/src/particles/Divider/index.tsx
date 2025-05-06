import { createMemo } from 'solid-js';
import clsx from 'clsx';

export type DividerProps = {
  class?: string;
};

function Divider(props: DividerProps) {
  const classes = createMemo(() => clsx('relative', props.class));
  return (
    <div class={classes()}>
      <div aria-hidden="true" class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300" />
      </div>
    </div>
  );
}

export default Divider;
