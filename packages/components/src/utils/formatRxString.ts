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
  const refills = Math.max(fillsAllowed - 1, 0);
  return `${dispenseQuantity} ${dispenseUnit}, ${refills} Refill${
    refills === 1 ? '' : 's'
  } - ${instructions}`;
}
