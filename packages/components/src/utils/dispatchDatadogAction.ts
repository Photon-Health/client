export const dispatchDatadogAction = (
  action: string,
  data: {
    [key: string]: unknown;
  },
  ref?: HTMLElement
) => {
  const event = new CustomEvent('photon-datadog-action', {
    composed: true,
    bubbles: true,
    detail: {
      action,
      data
    }
  });
  ref?.dispatchEvent(event);
};
