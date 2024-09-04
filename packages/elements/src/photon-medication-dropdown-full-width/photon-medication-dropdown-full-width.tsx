//Solid
import { debounce } from '@solid-primitives/scheduled';
import { Dynamic } from 'solid-js/web';
import { createEffect, createMemo, createSignal, For, JSXElement, onMount, Show } from 'solid-js';

//Shoelace
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { setDefaultAnimation } from '@shoelace-style/shoelace/dist/utilities/animation-registry.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

//Styles
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import tailwind from '../tailwind.css?inline';
import styles from './style.css?inline';

//Types
import { Treatment, PrescriptionTemplate, TreatmentOption } from '@photonhealth/sdk/dist/types';

//Virtual List
import { createVirtualizer, VirtualItem } from '@tanstack/solid-virtual';

// Disable the default dropdown animation
// TODO: Remove when the dropdown is swapped for a regular list
setDefaultAnimation('dropdown.show', null);

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

export const PhotonMedicationDropdownFullWidth = <
  T extends Treatment | PrescriptionTemplate | TreatmentOption
>(props: {
  data: Array<T>;
  label?: string;
  required?: boolean;
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
  open: boolean;
  searchText: string;
  onClose: () => void;
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
  const [selected, setSelected] = createSignal<T | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = createSignal(-1);

  const debounceSearch = debounce(async (s: string) => {
    if (props.onSearchChange) {
      await props.onSearchChange(s);
    }
  }, 250);

  createEffect(() => {
    if (props.open) {
      dropdownRef?.show();
      handleDropdownShow();
    }
  });

  createEffect(() => {
    if (props.data.length === 0) {
      // if the source data changes then reset the selected value
      setSelected(undefined);
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
      dispatchSelect(props.selectedData);
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

      if (props.open) {
        requestAnimationFrame(() => {
          inputRef.focus();
          inputRef.click();
        });
      }
    }
  });
  type GroupedItem<T extends Treatment | PrescriptionTemplate | TreatmentOption> =
    | GroupTitle
    | DataItem<T>;

  // Title and group items as one flat array
  const allItems = createMemo<GroupedItem<T>[]>(() =>
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
      getScrollElement: () => listRef,
      estimateSize: () => 42,
      overscan: 100
    })
  );

  const adjustDropdownHeight = () => {
    if (overlayRef) {
      const availableHeight = window.innerHeight - overlayRef.getBoundingClientRect().top;
      overlayRef.style.maxHeight = `${availableHeight - 105}px`; // Subtract some padding if needed
    }
  };

  // Call the adjustment function when the dropdown is shown
  const handleDropdownShow = () => {
    adjustDropdownHeight();
  };

  return (
    <div ref={ref}>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <div class="fixed top-0 left-0 w-full h-screen z-10 overflow-y-scroll bg-white">
        <div class={`flex items-center pb-2 pl-5 pr-5 pt-3`}>
          <div class="flex items-center" style={{ 'font-size': '26px' }}>
            <sl-icon-button
              name="x"
              label="Close medication search"
              class="full-screen-close-btn"
              style={{ padding: '0px' }}
              on:click={() => {
                if (props.onClose) {
                  props.onClose();
                }
              }}
            />
          </div>

          {props.label ? (
            <div class={`md:flex flex-1 justify-center items-center pl-2`}>
              <div class="flex items-center space-x-2">
                <p class={`text-gray-700 text-sm font-sans inline font-medium`}>{props.label}</p>
              </div>
            </div>
          ) : null}

          {props.required ? <p class="pl-1 text-red-400">*</p> : null}
          {props.optional ? <p class="text-gray-400 text-xs pl-2 font-sans">Optional</p> : null}
        </div>
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
          }}
          style={{ width: '100%' }}
        >
          <sl-input
            value={props.searchText}
            ref={inputRef}
            slot="trigger"
            placeholder={props.placeholder}
            clearable
            autocomplete="off"
            disabled={props.disabled ?? false}
            size="medium"
            style={{
              'padding-left': '20px',
              'padding-right': '20px',
              'border-radius': '0px',
              border: '0px'
            }}
            classList={{
              'treatment-search': true,
              invalid: props.invalid ?? false,
              input: true,
              disabled: props.disabled ?? false,
              placeholder: !selected() && inputRef.value === ''
            }}
            required={props.required}
            on:input={(e: any) => {
              debounceSearch(e.target.value);
            }}
            on:sl-focus={() => {
              dropdownRef.children[1].style.width = `${inputRef.clientWidth}px`;
              if (selectedIndex() > 0) {
                rowVirtualizer().scrollToIndex(selectedIndex());
              }
            }}
            on:sl-clear={() => {
              setSelected(undefined);
              setSelectedIndex(-1);
              inputRef.value = '';
              debounceSearch('');
              dispatchDeselect();
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
                  }}
                />
              </div>
            </Show>
          </sl-input>
          <div class={`border border-gray-200 overflow-hidden relative mt-3`}>
            <div
              ref={overlayRef}
              class="bg-white overflow-x-hidden overflow-y-auto relative"
              style={{
                'max-height': '85vh',
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

                    const ComponentToRender = 'title' in datum ? GroupLabelEl : ItemEl;
                    const componentProps =
                      'title' in datum
                        ? { item: datum as GroupTitle }
                        : {
                            item: vr,
                            isLoader: isLoaderRow,
                            isSelected: isSelected,
                            index: vr.index,
                            hasMore: props.hasMore,
                            showOverflow: props.showOverflow,
                            onClick: () => {
                              if (!isLoaderRow) {
                                setSelected((datum as DataItem<T>).data as ThisisNotAFunction<T>);
                                setSelectedIndex((datum as DataItem<T>).allItemsIdx);
                                inputRef.value = '';
                                debounceSearch('');
                                dispatchSelect((datum as DataItem<T>).data);

                                if (props.onClose) {
                                  props.onClose();
                                }
                              }
                            }
                          };

                    return (
                      <Dynamic component={ComponentToRender} {...componentProps}>
                        {'data' in datum &&
                          props.displayAccessor((datum as DataItem<T>).data, true)}
                      </Dynamic>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </sl-dropdown>
      </div>
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
  <sl-menu-item
    class="group uppercase"
    style={{
      // fix the group headers on scroll
      position: 'sticky',
      top: '0px',
      'z-index': 10
    }}
  >
    {props.item.title}
  </sl-menu-item>
);

const ItemEl = (props: {
  item: VirtualItem<unknown>;
  index: number;
  isLoader: boolean;
  isSelected: boolean;
  onClick: () => void;
  hasMore: boolean;
  showOverflow?: boolean;
  children: JSXElement;
}) => {
  return (
    <sl-menu-item
      classList={{
        selected: props.isSelected,
        'treatment-option': true
      }}
      onClick={() => props.onClick()}
      style={{
        width: '100%',
        'min-height': `${props.item.size}px`
      }}
    >
      {props.isLoader ? (
        props.hasMore ? (
          <p class="text-center text-gray-400 italic px-3">Loading...</p>
        ) : (
          <p class="text-center text-gray-400 italic px-3">Nothing more to load</p>
        )
      ) : (
        <div class="px-3">{props.children}</div>
      )}
    </sl-menu-item>
  );
};
