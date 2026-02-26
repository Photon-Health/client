import { createEffect, createMemo, createSignal, For, on, onMount, Show } from 'solid-js';
import { createVirtualizer } from '@tanstack/solid-virtual';
import { debounce } from '@solid-primitives/scheduled';
import Icon from '../../particles/Icon';
import Spinner from '../../particles/Spinner';
import MedicationSearchItemRow from './MedicationSearchItem';
import MedicationSearchGroupLabel from './MedicationSearchGroupLabel';
import MedicationSearchEmptyState from './MedicationSearchEmptyState';
import {
  DataItem,
  GroupedItem,
  GroupTitle,
  isGroupTitle,
  MedicationSearchMobileProps
} from './types';

const ESTIMATE_SIZE = 42;
const OVERSCAN = 100;
const DEBOUNCE_MS = 300;

export default function MedicationSearchMobile(props: MedicationSearchMobileProps) {
  let listRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;
  let overlayRef: HTMLDivElement | undefined;

  const [localSearch, setLocalSearch] = createSignal(props.searchText);
  const [isSearching, setIsSearching] = createSignal(false);

  // Sync external searchText → local
  createEffect(
    on(
      () => props.searchText,
      (text) => setLocalSearch(text)
    )
  );

  // Debounced search callback with "Searching..." indicator
  const debouncedSearch = debounce((text: string) => {
    props.onSearchChange(text);
    setIsSearching(false);
  }, DEBOUNCE_MS);

  // Auto-focus input when overlay opens
  createEffect(
    on(
      () => props.open,
      (open) => {
        if (open) {
          setTimeout(() => inputRef?.focus(), 100);
        }
      }
    )
  );

  // Focus trap: keep Tab within the overlay
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      props.onClose();
      return;
    }

    if (e.key === 'Tab' && overlayRef) {
      const focusable = overlayRef.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // Build grouped + flattened items for virtualizer
  const allItems = createMemo<GroupedItem[]>(() => {
    const items: GroupedItem[] = [];
    for (const group of props.groups) {
      const filtered = props.data.filter(group.filter);
      if (filtered.length > 0) {
        items.push({ title: group.label } as GroupTitle);
        for (const d of filtered) {
          items.push({ data: d, allItemsIdx: items.length } as DataItem);
        }
      }
    }

    if (items.length === 0 && props.data.length > 0) {
      for (const d of props.data) {
        items.push({ data: d, allItemsIdx: items.length } as DataItem);
      }
    }

    return items;
  });

  const virtualizer = createVirtualizer({
    get count() {
      return allItems().length;
    },
    getScrollElement: () => listRef ?? null,
    estimateSize: () => ESTIMATE_SIZE,
    overscan: OVERSCAN
  });

  const handleSelect = (dataItem: DataItem) => {
    props.onSelect(dataItem.data);
    props.onClose();
  };

  const handleClear = () => {
    setLocalSearch('');
    debouncedSearch('');
    props.onDeselect();
    inputRef?.focus();
  };

  return (
    <Show when={props.open}>
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search for treatment"
        class="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden"
        style={{ height: '100dvh' }}
        onKeyDown={handleKeyDown}
      >
        {/* Compact sticky header: close button + search input in one row */}
        <div
          class="flex items-center gap-2 px-3 py-2 border-b border-gray-200 flex-shrink-0"
          style={{ 'touch-action': 'none' }}
        >
          <button
            type="button"
            class="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700"
            onClick={() => props.onClose()}
            aria-label="Close medication search"
          >
            <Icon name="xMark" size="md" />
          </button>
          <div class="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              class="w-full rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={props.placeholder ?? 'Search for treatment'}
              value={localSearch()}
              autocomplete="off"
              disabled={props.disabled}
              onInput={(e) => {
                const text = e.currentTarget.value;
                setLocalSearch(text);
                setIsSearching(true);
                debouncedSearch(text);
              }}
              onKeyDown={(e) => {
                // Prevent space from triggering parent handlers
                if (e.key === ' ') {
                  e.stopImmediatePropagation();
                }
              }}
            />
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Show when={props.isLoading}>
                <Spinner size="sm" />
              </Show>
              <Show when={!props.isLoading && (props.selectedData || localSearch())}>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600"
                  onClick={handleClear}
                  aria-label="Clear search"
                >
                  <Icon name="xMark" size="sm" />
                </button>
              </Show>
            </div>
          </div>
        </div>

        {/* Scrollable results list */}
        <div ref={listRef} class="flex-1 overflow-y-auto">
          <Show
            when={allItems().length > 0}
            fallback={
              <MedicationSearchEmptyState
                isLoading={props.isLoading}
                isSearching={isSearching()}
              />
            }
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative'
              }}
            >
              <For each={virtualizer.getVirtualItems()}>
                {(virtualItem) => {
                  const item = () => allItems()[virtualItem.index];
                  return (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`
                      }}
                    >
                      <Show
                        when={!isGroupTitle(item())}
                        fallback={
                          <MedicationSearchGroupLabel
                            label={(item() as GroupTitle).title}
                            sticky
                          />
                        }
                      >
                        {(() => {
                          const dataItem = item() as DataItem;
                          const isSelected = () =>
                            props.selectedData &&
                            'id' in props.selectedData &&
                            'id' in dataItem.data &&
                            props.selectedData.id === dataItem.data.id;
                          return (
                            <MedicationSearchItemRow
                              selected={isSelected()}
                              onClick={() => handleSelect(dataItem)}
                            >
                              {props.displayAccessor(
                                dataItem.data,
                                true,
                                localSearch(),
                                undefined,
                                undefined
                              )}
                            </MedicationSearchItemRow>
                          );
                        })()}
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}