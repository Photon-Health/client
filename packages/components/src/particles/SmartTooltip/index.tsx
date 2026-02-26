import { createSignal, JSXElement, onCleanup, onMount, Show } from 'solid-js';

export type SmartTooltipProps = {
  children: JSXElement;
  text: string;
};

export default function SmartTooltip(props: SmartTooltipProps) {
  let triggerRef: HTMLDivElement | undefined;
  let tooltipRef: HTMLDivElement | undefined;
  const [visible, setVisible] = createSignal(false);
  const [side, setSide] = createSignal<'top' | 'bottom'>('top');
  const [offsetX, setOffsetX] = createSignal(0);

  const updatePosition = () => {
    if (!triggerRef || !tooltipRef) return;

    const triggerRect = triggerRef.getBoundingClientRect();
    const tooltipRect = tooltipRef.getBoundingClientRect();
    const pad = 8;

    // Vertical: prefer top, fall back to bottom
    if (triggerRect.top - tooltipRect.height - pad < 0) {
      setSide('bottom');
    } else {
      setSide('top');
    }

    // Horizontal: nudge so tooltip stays within viewport
    const tooltipLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    const tooltipRight = tooltipLeft + tooltipRect.width;

    if (tooltipLeft < pad) {
      setOffsetX(pad - tooltipLeft);
    } else if (tooltipRight > window.innerWidth - pad) {
      setOffsetX(window.innerWidth - pad - tooltipRight);
    } else {
      setOffsetX(0);
    }
  };

  const show = () => {
    setVisible(true);
    requestAnimationFrame(updatePosition);
  };
  const hide = () => setVisible(false);
  const toggle = () => (visible() ? hide() : show());

  const handleOutside = (e: MouseEvent) => {
    if (visible() && triggerRef && !triggerRef.contains(e.target as Node)) {
      hide();
    }
  };

  onMount(() => {
    document.addEventListener('click', handleOutside, true);
  });

  onCleanup(() => {
    document.removeEventListener('click', handleOutside, true);
  });

  return (
    <div
      ref={triggerRef}
      class="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusIn={show}
      onFocusOut={hide}
      onClick={toggle}
    >
      {props.children}
      <Show when={visible()}>
        <div
          ref={tooltipRef}
          role="tooltip"
          class="absolute z-50 whitespace-normal rounded bg-gray-900 px-3 py-2 text-sm leading-snug text-gray-50 shadow-lg"
          style={{
            width: '360px',
            'max-width': `min(360px, calc(100vw - 16px))`,
            left: `calc(50% + ${offsetX()}px)`,
            transform: 'translateX(-50%)',
            ...(side() === 'top'
              ? { bottom: '100%', 'margin-bottom': '8px' }
              : { top: '100%', 'margin-top': '8px' })
          }}
        >
          {props.text}
        </div>
      </Show>
    </div>
  );
}
