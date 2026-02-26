import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createVirtualizer } from '@tanstack/solid-virtual';
import { debounce } from '@solid-primitives/scheduled';
import Input from '../../particles/Input';
import InputGroup from '../../particles/InputGroup';
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
  MedicationSearchDropdownProps
} from './types';

const ESTIMATE_SIZE = 36.8;
const OVERSCAN = 100;
const DEBOUNCE_MS = 250;

export default function MedicationSearchDesktop(props: MedicationSearchDropdownProps) {
  let containerRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;
  let listRef: HTMLDivElement | undefined;

  const [open, setOpen] = createSignal(false);
  const [localSearch, setLocalSearch] = createSignal(props.searchText);
  const [dropUp, setDropUp] = createSignal(false);
  const [activeIndex, setActiveIndex] = createSignal(-1);

  // Sync external searchText → local
  createEffect(
    on(
      () => props.searchText,
      (text) => setLocalSearch(text)
    )
  );

  // Debounced search callback
  const debouncedSearch = debounce((text: string) => {
    props.onSearchChange(text);
  }, DEBOUNCE_MS);

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

    // If no groups matched but we have ungrouped data, show it flat
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

  // Calculate dropdown direction based on viewport space
  const calculateDropdownPosition = () => {
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 320;
    setDropUp(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
  };

  // IntersectionObserver for fetchMore
  let observerTarget: HTMLDivElement | undefined;
  let observer: IntersectionObserver | undefined;

  onMount(() => {
    if (props.fetchMore && observerTarget) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && props.hasMore && !props.isLoading) {
            props.fetchMore?.();
          }
        },
        { threshold: 0.1 }
      );
    }
  });

  onCleanup(() => observer?.disconnect());

  // Observe the sentinel when the list opens
  createEffect(() => {
    if (open() && observerTarget && observer) {
      observer.observe(observerTarget);
    } else if (observer && observerTarget) {
      observer.unobserve(observerTarget);
    }
  });

  // Click outside to close
  const handleClickOutside = (e: MouseEvent) => {
    if (open() && containerRef && !containerRef.contains(e.target as Node)) {
      closeDropdown();
    }
  };

  onMount(() => document.body.addEventListener('click', handleClickOutside));
  onCleanup(() => document.body.removeEventListener('click', handleClickOutside));

  const openDropdown = () => {
    calculateDropdownPosition();
    setOpen(true);
    setActiveIndex(-1);
    props.onOpen?.();
  };

  const closeDropdown = () => {
    setOpen(false);
    props.onHide?.();
  };

  const handleSelect = (item: DataItem) => {
    props.onSelect(item.data);
    closeDropdown();
  };

  const handleClear = () => {
    setLocalSearch('');
    debouncedSearch('');
    props.onDeselect();
    inputRef?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open()) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    const items = allItems();
    const dataIndices = items
      .map((item, i) => (!isGroupTitle(item) ? i : -1))
      .filter((i) => i >= 0);

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const currentPos = dataIndices.indexOf(activeIndex());
        const nextPos = Math.min(currentPos + 1, dataIndices.length - 1);
        setActiveIndex(dataIndices[nextPos]);
        virtualizer.scrollToIndex(dataIndices[nextPos]);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const currentPos = dataIndices.indexOf(activeIndex());
        const nextPos = Math.max(currentPos - 1, 0);
        setActiveIndex(dataIndices[nextPos]);
        virtualizer.scrollToIndex(dataIndices[nextPos]);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const active = items[activeIndex()];
        if (active && !isGroupTitle(active)) {
          handleSelect(active);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        closeDropdown();
        break;
      }
    }
  };

  const listboxId = `med-search-listbox-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div ref={containerRef} class="relative w-full">
      <InputGroup
        label={props.label}
        required={props.required}
        error={props.invalid ? props.helpText : undefined}
      >
        <div class="relative">
          <Input
            ref={inputRef}
            role="combobox"
            aria-expanded={open()}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex() >= 0 ? `${listboxId}-item-${activeIndex()}` : undefined
            }
            aria-autocomplete="list"
            type="text"
            placeholder={props.placeholder ?? 'Search for treatment'}
            value={localSearch()}
            disabled={props.disabled}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
              const text = e.currentTarget.value;
              setLocalSearch(text);
              debouncedSearch(text);
              if (!open()) openDropdown();
            }}
            onFocus={() => {
              if (!open()) openDropdown();
            }}
            onKeyDown={handleKeyDown}
          />
          <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Show when={props.isLoading}>
              <Spinner size="sm" />
            </Show>
            <Show when={props.selectedData || localSearch()}>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600"
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <Icon name="xMark" size="sm" />
              </button>
            </Show>
          </div>
        </div>
      </InputGroup>

      <Show when={open()}>
        <div
          id={listboxId}
          role="listbox"
          class={`absolute z-50 w-full bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-hidden ${
            dropUp() ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{ 'max-height': '320px' }}
        >
          <Show
            when={allItems().length > 0 || props.isLoading}
            fallback={<MedicationSearchEmptyState isLoading={props.isLoading} />}
          >
            <div
              ref={listRef}
              class="overflow-auto"
              style={{ 'max-height': '320px' }}
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
                            const isActive = () => virtualItem.index === activeIndex();
                            return (
                              <MedicationSearchItemRow
                                id={`${listboxId}-item-${virtualItem.index}`}
                                selected={isSelected() || isActive()}
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
              {/* Sentinel for fetchMore */}
              <div ref={observerTarget} style={{ height: '1px' }} />
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}