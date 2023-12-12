export default function formatRxString({
  dispenseQuantity = 0,
  dispenseUnit = '',
  fillsAllowed = 0,
  instructions = ''
}: {
  dispenseQuantity?: number;
  dispenseUnit?: string;
  fillsAllowed?: number;
  instructions?: string;
}): string {
  return `${dispenseQuantity} ${dispenseUnit}, ${fillsAllowed || 0} Refill${
    (fillsAllowed || 0) === 1 ? '' : 's'
  } - ${instructions}`;
}
