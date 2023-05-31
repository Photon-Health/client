import { customElement } from 'solid-element';
import { createSignal } from 'solid-js';

//Styles
import tailwind from '../tailwind.css?inline';

customElement(
  'photon-card',
  {
    invalid: false,
    title: null,
    collapsable: false
  },
  (props: { invalid: boolean; title: string | null; collapsable: boolean }) => {
    const [isCollapsed, setIsCollapsed] = createSignal<boolean>(true);

    let titleElement = null;
    let collapsableElement = null;
    if (props.title) {
      titleElement = <p class="font-sans text-l font-medium mb-2">{props.title}</p>;
    }
    if (props.collapsable) {
      collapsableElement = (
        <sl-icon-button
          name={isCollapsed() ? 'chevron-right' : 'chevron-down'}
          on:click={() => {
            setIsCollapsed(!isCollapsed());
          }}
          class="self-start"
        />
      );
    }

    return (
      <>
        <style>{tailwind}</style>
        <div
          class="rounded-lg bg-white p-4 shadow-card border border-gray-200"
          classList={{
            'border-red-500': props.invalid,
            'border-2': props.invalid
          }}
        >
          {titleElement || collapsableElement ? (
            <div class="flex flex-row justify-between">
              {titleElement}
              {collapsableElement}
            </div>
          ) : null}
          {props.collapsable && isCollapsed() ? null : <slot />}
        </div>
      </>
    );
  }
);
