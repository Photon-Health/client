import { createMemo, For } from 'solid-js';

export interface TabsProps<T extends string> {
  tabs: T[];
  activeTab: T;
  setActiveTab: (tab: T) => void;
}

export default function Tabs<T extends string>(props: TabsProps<T>) {
  const regularClass =
    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium cursor-pointer';
  const activeClass =
    'border-blue-500 text-blue-600 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium';

  return (
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-4 sm:space-x-6 md:space-x-8" aria-label="Tabs">
        <For each={props.tabs}>
          {(tab) => {
            const isActive = createMemo(() => tab === props.activeTab);
            return (
              <div
                class={isActive() ? activeClass : regularClass}
                onClick={() => props.setActiveTab(tab)}
                aria-current={isActive() ? 'page' : undefined}
              >
                {tab}
              </div>
            );
          }}
        </For>
      </nav>
    </div>
  );
}
