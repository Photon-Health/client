export const formatPrice = (price: number) => {
  return Number.isInteger(price) ? Math.round(price) : price.toFixed(2);
};
