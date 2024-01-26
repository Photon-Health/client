export const dispatchDatadogAction = (
  action: string,
  data: {
    [key: string]: unknown;
  },
  ref: { dispatchEvent(event: CustomEvent): void }
) => {
  const event = new CustomEvent('photon-datadog-action', {
    composed: true,
    bubbles: true,
    detail: {
      action,
      data: { ...data, timestamp: new Date().toISOString() }
    }
  });
  ref?.dispatchEvent(event);
};
