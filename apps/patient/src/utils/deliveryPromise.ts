// Parses day ranges via regex (e.g. "Same day" → 0, "...2-3 days" → 3, "...1-4 days" → 4)
export function getLatestDelivery(deliveryPromises: string[]): string | undefined {
  if (deliveryPromises.length === 0) return undefined;

  const parseDays = (promise: string) => {
    const match = promise.match(/(\d+)(?:\s*[–]\s*(\d+))?\s*day/i); // regex match looks like [original string, lower bound, upper bound]
    if (!match) return 0;
    return parseInt(match[2]); // upper bound of the day range
  };
  return [...deliveryPromises].sort((a, b) => parseDays(b) - parseDays(a))[0];
}
