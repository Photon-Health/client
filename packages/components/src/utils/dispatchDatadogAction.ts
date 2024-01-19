import { usePhotonClient } from '../systems/SDKProvider';

export const dispatchDatadogAction = (
  action: string,
  data: {
    [key: string]: unknown;
  }
) => {
  const { ref } = usePhotonClient();
  console.log('dispatchDatadogAction', action, data, ref);
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
