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
  let listRef: HTMLDivElement | undefined;
  let inputRef: any;

  if (props.actionRef) {
    props.actionRef['clear'] = () => {
      setSelected(undefined);
      inputRef.value = '';
      debounceSearch('');
      dispatchDeselect();
    };
  }

  //signals
  const [selected, setSelected] = createSignal<T | undefined>(undefined);

  const debounceSearch = debounce(async (s: string) => {
    if (props.onSearchChange) {
      await props.onSearchChange(s);
    }
  }, 250);

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

      setTimeout(() => {
        inputRef.focus(); // Focus input after the touch event
      }, 100);
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

  return (
    <div ref={ref}>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      <div class="fixed top-0 left-0 w-full h-screen z-10 bg-white overflow-x-hidden">
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
            placeholder: !selected() && inputRef.value === '',
            'mb-2': true
          }}
          required={props.required}
          on:input={(e: any) => {
            debounceSearch(e.target.value);
          }}
          on:sl-clear={() => {
            setSelected(undefined);
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
                  inputRef.value = '';
                  debounceSearch('');
                  dispatchDeselect();
                }}
              />
            </div>
          </Show>
        </sl-input>
        <div class="w-full flex-1" ref={listRef}>
          <For
            each={rowVirtualizer().getVirtualItems()}
            fallback={<EmptyEl isLoading={props.isLoading} />}
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
                  {'data' in datum && props.displayAccessor((datum as DataItem<T>).data, true)}
                </Dynamic>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

const EmptyEl = (props: { isLoading: boolean; noDataMsg?: string }) => {
  return (
    <Show
      when={props.isLoading}
      fallback={
        <div>
          <p class="text-gray-400">No treatments found</p>
        </div>
      }
    >
      <div>
        <p class="text-gray-400">Loading...</p>
      </div>
    </Show>
  );
};

const GroupLabelEl = (props: { item: GroupTitle }) => (
  <div
    class="group uppercase px-4"
    style={{
      // fix the group headers on scroll
      position: 'sticky',
      top: '0px',
      'z-index': 10
    }}
  >
    {props.item.title}
  </div>
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
    <div
      classList={{
        'bg-blue-500': props.isSelected,
        'text-white': props.isSelected,
        'treatment-option': true
      }}
      onClick={() => props.onClick()}
      style={{
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
        <div class="px-4 py-1">{props.children}</div>
      )}
    </div>
  );
};
