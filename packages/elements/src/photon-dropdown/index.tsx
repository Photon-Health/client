//Solid
import { debounce } from '@solid-primitives/scheduled';
import { createEffect, createSignal, For, JSXElement, onMount, Show } from 'solid-js';

//Shoelace
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/spinner/spinner';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.82/dist/');

//Styles
import tailwind from '../tailwind.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import styles from './style.css?inline';

//Virtual List
import { createVirtualizer } from '@tanstack/solid-virtual';

export const PhotonDropdown = <T extends { id: string }>(props: {
  data: Array<T>;
  label?: string;
  required: boolean;
  placeholder?: string;
  forceLabelSize?: boolean;
  invalid?: boolean;
  onSearchChange?: Function;
  displayAccessor: (selected: T, groupDisplay: boolean) => string | JSXElement;
  disabled?: boolean;
  onOpen?: Function;
  onHide?: Function;
  isLoading: boolean;
  hasMore: boolean;
  noDataMsg?: string;
  helpText?: string;
  fetchMore?: Function;
  selectedData?: T | undefined;
  groups?: Array<{
    label: string;
    filter: Function;
  }>;
  showOverflow?: boolean;
  optional?: boolean;
  clearable?: boolean;
  actionRef?: any;
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
  const [search, setSearch] = createSignal('');
  const [selected, setSelected] = createSignal<T>();
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  const [virtualizer, setVirtualizer] = createSignal(
    createVirtualizer({
      count: props.data.length,
      getScrollElement: () => listRef,
      estimateSize: () => 36.8,
      overscan: 25
    })
  );
  const [lastIndex, setLastIndex] = createSignal();

  const debounceSearch = debounce(async (s: string) => {
    setSearch(s);
    if (props.onSearchChange) {
      await props.onSearchChange(s);
    }
  }, 250);

  const observer = new IntersectionObserver(async (a) => {
    if (a?.at(-1)?.isIntersecting && props.hasMore) {
      if (props.fetchMore) {
        await props.fetchMore(search());
      }
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
      dispatchSelect(props.selectedData);
    }
    if (props.selectedData === undefined) {
      setSelected(undefined);
    }
  });

  createEffect(() => {
    const minHeight = props.data.length * 36.8;
    listRef!.style.minHeight = `${minHeight}px`;
    const virtualizer = createVirtualizer({
      count: props.hasMore ? props.data.length + 1 : props.data.length,
      getScrollElement: () => listRef,
      estimateSize: () => 36.8,
      overscan: !props.fetchMore ? props.data.length : 25
    });
    setVirtualizer(virtualizer);
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

  return (
    <div ref={ref}>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{styles}</style>
      {props.label ? (
        <div class="flex items-center pt-2 pb-2">
          <p class="text-gray-700 text-sm font-sans">{props.label}</p>
          {props.required ? <p class="pl-1 text-red-500">*</p> : null}
          {props.optional ? <p class="text-gray-400 text-xs pl-2 font-sans">Optional</p> : null}
        </div>
      ) : null}
      <sl-dropdown
        ref={dropdownRef}
        class="dropdown relative"
        hoist
        distance={props.forceLabelSize && !props.invalid ? -20 : props.invalid ? -18 : 0}
        disabled={props.disabled ?? false}
        on:sl-hide={async () => {
          if (!selected()) {
            inputRef.value = '';
            setSearch('');
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
          placeholder={
            selected()
              ? props.displayAccessor(selected()!, false)
              : props.placeholder ?? 'Select data...'
          }
          disabled={props.disabled ?? false}
          size="medium"
          classList={{
            invalid: props.invalid ?? false,
            input: true,
            disabled: props.disabled ?? false
          }}
          required={props.required}
          on:sl-input={(e: any) => {
            if (!open()) {
              dropdownRef.show();
            }
            debounceSearch(e.target.value);
          }}
          on:sl-focus={() => {
            dropdownRef.children[1].style.width = `${inputRef.clientWidth}px`;
            if (selectedIndex() > 0) {
              virtualizer().scrollToIndex(selectedIndex());
            }
          }}
        >
          <p
            slot="help-text"
            class="text-red-500 pt-2 font-sans"
            classList={{
              'h-[28px]': props.forceLabelSize
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
            <sl-spinner slot="suffix"></sl-spinner>
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
              ></sl-icon>
            </div>
          </Show>
          <div
            slot="suffix"
            classList={{
              flex: true,
              hidden: props.isLoading
            }}
          >
            <sl-icon name={open() ? 'chevron-up' : 'chevron-down'}></sl-icon>
          </div>
        </sl-input>
        <div class="border border-gray-200 dropdown-container overflow-hidden relative">
          <div
            ref={overlayRef}
            class="bg-white pt-2 overflow-x-hidden overflow-y-auto relative"
            style={{
              'max-height': '200px',
              'min-height': '56px',
              width: '100%'
            }}
          >
            <div
              style={{
                'min-height': `36.8px`,
                width: '100%'
              }}
              ref={listRef}
            >
              <Show when={props.data.length > 0 && !props.groups}>
                {virtualizer()
                  .getVirtualItems()
                  .map((vr: any) => {
                    const isLoaderRow = vr.index > props.data.length - 1;
                    const datum = props.data[vr.index];
                    return (
                      <sl-menu-item
                        class={
                          datum && datum.id === selected()?.id && !isLoaderRow
                            ? 'selected default'
                            : 'default'
                        }
                        onclick={() => {
                          if (!isLoaderRow) {
                            // @ts-ignore
                            setSelected(datum);
                            setSelectedIndex(vr.index);
                            inputRef.value = '';
                            debounceSearch('');
                            dispatchSelect(datum);
                            dropdownRef.hide();
                          }
                        }}
                        ref={(r: Element) => {
                          if (isLoaderRow && vr.index > 0) {
                            setLastIndex(r);
                          }
                        }}
                        style={{
                          width: '100%',
                          'min-height': `${vr.size}px`
                        }}
                      >
                        {isLoaderRow ? (
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
                            {props.displayAccessor(datum, true)}
                          </p>
                        )}
                      </sl-menu-item>
                    );
                  })}
              </Show>
              <Show when={props.data.length > 0 && props.groups && props.groups.length > 0}>
                <For each={props.groups || []}>
                  {(el) => (
                    <>
                      <sl-menu-item
                        class="group"
                        classList={{
                          hidden:
                            virtualizer()
                              .getVirtualItems()
                              .filter((vr) => el.filter(props.data[vr.index])).length === 0
                        }}
                      >
                        {el.label}
                      </sl-menu-item>
                      {virtualizer()
                        .getVirtualItems()
                        .filter((vr) => el.filter(props.data[vr.index]))
                        .map((vr: any) => {
                          const isLoaderRow = vr.index > props.data.length - 1;
                          const datum = props.data[vr.index];
                          return (
                            <sl-menu-item
                              class={
                                datum && datum.id === selected()?.id && !isLoaderRow
                                  ? 'selected default group-member'
                                  : 'default group-member'
                              }
                              onclick={() => {
                                if (!isLoaderRow) {
                                  // @ts-ignore
                                  setSelected(datum);
                                  setSelectedIndex(vr.index);
                                  inputRef.value = '';
                                  debounceSearch('');
                                  dispatchSelect(datum);
                                  dropdownRef.hide();
                                }
                              }}
                              ref={(r: Element) => {
                                if (isLoaderRow && vr.index > 0) {
                                  setLastIndex(r);
                                }
                              }}
                              style={{
                                width: '100%',
                                'min-height': `${vr.size}px`
                              }}
                            >
                              {isLoaderRow ? (
                                props.hasMore ? (
                                  <p class="text-center text-gray-400 italic">Loading...</p>
                                ) : (
                                  <p class="text-center text-gray-400 italic">
                                    Nothing more to load
                                  </p>
                                )
                              ) : (
                                <p class="overflow-hidden overflow-ellipsis whitespace-nowrap">
                                  {props.displayAccessor(datum, true)}
                                </p>
                              )}
                            </sl-menu-item>
                          );
                        })}
                    </>
                  )}
                </For>
              </Show>
              <Show when={props.data.length == 0 && !props.isLoading}>
                <sl-menu-item>{props.noDataMsg ? props.noDataMsg : 'No data found'}</sl-menu-item>
              </Show>
              <Show when={props.data.length == 0 && props.isLoading}>
                <sl-menu-item>
                  <p class="text-center text-gray-400 italic">Loading...</p>
                </sl-menu-item>
              </Show>
            </div>
          </div>
        </div>
      </sl-dropdown>
    </div>
  );
};
