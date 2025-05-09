//Solid
import { debounce } from '@solid-primitives/scheduled';
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  JSXElement,
  Match,
  onMount,
  Show,
  Switch,
  Accessor
} from 'solid-js';

//Shoelace
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';

//Virtual List
import { createVirtualizer, VirtualItem } from '@tanstack/solid-virtual';

type Item<T = any> = DataItem<T> | GroupTitle;

interface DataItem<T> {
  data: T;
  // TODO: setting this to scroll to the correct index
  // after reopening the list, but not working ATM
  allItemsIdx: number;
}

interface GroupTitle {
  title: string;
}

// Typescript and solid are annoying
// eslint-disable-next-line @typescript-eslint/ban-types
type ThisisNotAFunction<T> = Exclude<T, Function>;

export const PhotonDropdown = <T extends { id: string }>(props: {
  data: Array<T>;
  label?: string;
  required: boolean;
  placeholder?: string;
  forceLabelSize?: boolean;
  invalid?: boolean;
  onSearchChange?: (search: string) => void;
  displayAccessor: (selected: T, groupDisplay: boolean) => string | JSXElement;
  disabled?: boolean;
  onOpen?: () => void;
  onHide?: () => void;
  isLoading: boolean;
  hasMore: boolean;
  noDataMsg?: string;
  helpText?: string;
  fetchMore?: () => void;
  selectedData?: T | undefined;
  groups?: Array<{
    label: string;
    filter: (arr: T) => boolean | undefined;
  }>;
  showOverflow?: boolean;
  optional?: boolean;
  clearable?: boolean;
  actionRef?: any;
  onInputFocus?: () => void;
}) => {
  //refs
  let ref: any;
  let dropdownRef: any;
  let listRef: HTMLDivElement | undefined;
  let inputRef: any;
  let overlayRef: HTMLDivElement | undefined;

  if (props.actionRef) {
    props.actionRef['clear'] = () => {
      setSelected(undefined);
      setSelectedIndex(-1);
      inputRef.value = '';
      debounceSearch('');
      dispatchDeselect();
    };
  }

  //signals
  const [open, setOpen] = createSignal(false);
  const [selected, setSelected] = createSignal<T | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [lastIndex, setLastIndex] = createSignal();

  const debounceSearch = debounce(async (s: string) => {
    if (props.onSearchChange) {
      await props.onSearchChange(s);
    }
  }, 250);

  const observer = new IntersectionObserver(async (a) => {
    if (a?.at(-1)?.isIntersecting && props.hasMore) {
      if (props.fetchMore) {
        await props.fetchMore();
      }
    }
  });

  createEffect(() => {
    if (props.data.length === 0) {
      // if the source data changes then reset the selected value
      setSelected(undefined);
    }
  });

  createEffect(() => {
    if (lastIndex()) {
      observer.observe(lastIndex() as Element);
    }
  });

  const showHelpText = (invalid: boolean) => {
    if (invalid) {
      if (props.helpText) {
        return props.helpText;
      }
      if (props.required) {
        return 'Please select data...';
      }
      return undefined;
    } else {
      return undefined;
    }
  };

  const dispatchSelect = (datum: T) => {
    const event = new CustomEvent('photon-data-selected', {
      composed: true,
      bubbles: true,
      detail: {
        data: datum
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchDeselect = () => {
    const event = new CustomEvent('photon-data-unselected', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  createEffect(() => {
    if (props.selectedData) {
      // @ts-ignore
      setSelected(props.selectedData);
    }
    if (props.selectedData === undefined) {
      setSelected(undefined);
    }
  });

  onMount(() => {
    if (inputRef) {
      inputRef.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.code == 'Space' || e.key == ' ') {
          e.stopImmediatePropagation();
        }
      });
    }
  });

  const placeholder = createMemo(() => {
    const selectedValue = selected();
    return selectedValue
      ? props.displayAccessor(selectedValue, false)
      : props.placeholder ?? 'Select data...';
  });

  // Title and group items as one flat array
  const allItems: Accessor<Item<T>[]> = createMemo(() =>
    props.groups
      ? props.groups
          .map((g) => {
            const data = props.data
              .map((d, idx) => ({ data: d, allItemsIdx: idx }))
              .filter((d) => g.filter(d.data));
            return data.length > 0 ? [{ title: g.label }, ...data] : [];
          })
          .flat()
      : props.data.map((d, idx) => ({ data: d, allItemsIdx: idx }))
  );

  const rowVirtualizer = createMemo(() =>
    createVirtualizer({
      count: allItems().length,
      getScrollElement: () => listRef ?? null,
      estimateSize: () => 36.8,
      overscan: 100
    })
  );

  return (
    <div ref={ref}>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <sl-dropdown
        ref={dropdownRef}
        class="dropdown relative"
        hoist
        distance={props.forceLabelSize && !props.invalid ? -20 : props.invalid ? -18 : 0}
        disabled={props.disabled ?? false}
        on:sl-hide={async () => {
          if (!selected()) {
            inputRef.value = '';
            if (props.onHide) {
              await props.onHide();
            }
          }
          setOpen(false);
        }}
        on:sl-show={async () => {
          setOpen(true);
          if (props.onOpen) {
            await props.onOpen();
          }
        }}
        style={{ width: '100%' }}
      >
        <sl-input
          ref={inputRef}
          slot="trigger"
          label={props.label}
          placeholder={placeholder()}
          autocomplete="off"
          disabled={props.disabled ?? false}
          size="medium"
          classList={{
            invalid: props.invalid ?? false,
            input: true,
            disabled: props.disabled ?? false,
            placeholder: !selected() && inputRef.value === ''
          }}
          required={props.required}
          on:sl-input={(e: any) => {
            if (!open()) {
              dropdownRef.show();
            }
            debounceSearch(e.target.value);
          }}
          on:click={async (e: any) => {
            // prevent sl-input click and sl-dropdown's trigger click
            // from causing a double-click and flickering the menu
            // when clicking the input's label
            e.preventDefault();
          }}
          on:sl-focus={(e: any) => {
            if (props.onInputFocus) {
              props.onInputFocus();
              e.stopImmediatePropagation();
            } else {
              dropdownRef.children[1].style.width = `${inputRef.clientWidth}px`;
              if (selectedIndex() > 0) {
                rowVirtualizer().scrollToIndex(selectedIndex());
              }
            }
          }}
        >
          <p
            slot="help-text"
            class="text-red-400 pt-1 font-sans"
            classList={{
              'h-[21px]': props.forceLabelSize
            }}
          >
            {showHelpText(props.invalid ?? false)}
          </p>
          <div
            slot="suffix"
            classList={{
              flex: true,
              hidden: !props.isLoading
            }}
          >
            <sl-spinner slot="suffix" />
          </div>
          <Show when={props.clearable}>
            <div
              slot="suffix"
              classList={{
                flex: true,
                hidden: props.isLoading || selected() == undefined
              }}
            >
              <sl-icon
                class="text-gray-400 hover:text-gray-600"
                name={'x-circle-fill'}
                on:click={(e: any) => {
                  e.stopImmediatePropagation();
                  setSelected(undefined);
                  setSelectedIndex(-1);
                  inputRef.value = '';
                  debounceSearch('');
                  dispatchDeselect();
                  dropdownRef.hide();
                }}
              />
            </div>
          </Show>
          <div
            slot="suffix"
            classList={{
              flex: true,
              hidden: props.isLoading
            }}
          >
            <sl-icon name={open() ? 'chevron-up' : 'chevron-down'} />
          </div>
        </sl-input>
        <div class="border border-gray-200 dropdown-container overflow-hidden relative">
          <div
            ref={overlayRef}
            class="bg-white overflow-x-hidden overflow-y-auto relative"
            style={{
              'max-height': '200px',
              'min-height': '37px',
              width: '100%',
              display: 'flex',
              'flex-direction': 'column',
              'justify-content': 'start'
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer().getTotalSize()}px`,
                width: '100%'
              }}
              ref={listRef}
            >
              <For
                each={rowVirtualizer().getVirtualItems()}
                fallback={<EmptyEl noDataMsg={props.noDataMsg} isLoading={props.isLoading} />}
              >
                {(vr) => {
                  const isLoaderRow = vr.index > allItems().length - 1;
                  const datum = allItems()[vr.index];

                  const selectedValue = selected();
                  const isSelected =
                    !isLoaderRow &&
                    !!selectedValue &&
                    'id' in selectedValue &&
                    'data' in datum &&
                    selectedValue.id === datum.data.id;

                  return (
                    <Switch>
                      <Match when={'title' in datum}>
                        <GroupLabelEl item={datum as GroupTitle} />
                      </Match>
                      <Match when={'data' in datum}>
                        <ItemEl
                          item={vr}
                          isLoader={isLoaderRow}
                          isSelected={isSelected}
                          index={vr.index}
                          hasMore={props.hasMore}
                          showOverflow={props.showOverflow}
                          onClick={() => {
                            if (!isLoaderRow) {
                              setSelected((datum as DataItem<T>).data as ThisisNotAFunction<T>);
                              setSelectedIndex((datum as DataItem<T>).allItemsIdx);
                              inputRef.value = '';
                              debounceSearch('');
                              dispatchSelect((datum as DataItem<T>).data);
                              dropdownRef.hide();
                            }
                          }}
                          setLastIndex={setLastIndex}
                        >
                          {props.displayAccessor((datum as DataItem<T>).data, true)}
                        </ItemEl>
                      </Match>
                    </Switch>
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </sl-dropdown>
    </div>
  );
};

const EmptyEl = (props: { isLoading: boolean; noDataMsg?: string }) => {
  return (
    <Show
      when={props.isLoading}
      fallback={<sl-menu-item>{props.noDataMsg ? props.noDataMsg : 'No data found'}</sl-menu-item>}
    >
      <sl-menu-item>
        <p class="text-center text-gray-400 italic">Loading...</p>
      </sl-menu-item>
    </Show>
  );
};

const GroupLabelEl = (props: { item: GroupTitle }) => (
  <sl-menu-item class="group">{props.item.title}</sl-menu-item>
);

const ItemEl = (props: {
  item: VirtualItem;
  index: number;
  isLoader: boolean;
  isSelected: boolean;
  onClick: () => void;
  setLastIndex: (r: Element) => void;
  hasMore: boolean;
  showOverflow?: boolean;
  children: JSXElement;
}) => {
  return (
    <sl-menu-item
      class={props.isSelected ? 'selected default' : 'default'}
      onClick={() => props.onClick()}
      ref={(r: Element) => {
        if (props.isLoader && props.index > 0) {
          props.setLastIndex(r);
        }
      }}
      style={{
        width: '100%',
        'min-height': `${props.item.size}px`
      }}
    >
      {props.isLoader ? (
        props.hasMore ? (
          <p class="text-center text-gray-400 italic">Loading...</p>
        ) : (
          <p class="text-center text-gray-400 italic">Nothing more to load</p>
        )
      ) : (
        <p
          classList={{
            'overflow-hidden': !props.showOverflow,
            'overflow-ellipsis': !props.showOverflow,
            'whitespace-nowrap': !props.showOverflow,
            'whitespace-normal': props.showOverflow
          }}
        >
          {props.children}
        </p>
      )}
    </sl-menu-item>
  );
};
