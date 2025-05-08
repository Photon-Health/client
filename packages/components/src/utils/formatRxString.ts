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
  const refills = getRefillsCount(fillsAllowed);
  return `${dispenseQuantity} ${dispenseUnit}, ${refills} Refill${
    refills === 1 ? '' : 's'
  } - ${instructions}`;
}

export function getRefillsCount(fillsAllowed = 0): number {
  return Math.max(fillsAllowed - 1, 0);
}
