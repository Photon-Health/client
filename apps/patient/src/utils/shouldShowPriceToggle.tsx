import { FillWithCount } from './general';
import { Order } from './models';
import { isGLP } from './isGLP';

// note: prices are only for single-rx right now
function shouldHideGlp1Prices(flattenedFills: FillWithCount[], organizationId: string) {
  const isOrgThatHidesGlp1Prices = orgsThatHideGlp1Prices.includes(organizationId);
  const hasGlp1 = flattenedFills.some((fill) => isGLP(fill.treatment.name));
  return isOrgThatHidesGlp1Prices && hasGlp1;
}

export function shouldShowPriceToggle(flattenedFills: FillWithCount[], order: Order): boolean {
  const hideGlp1Prices = shouldHideGlp1Prices(flattenedFills, order.organization.id);
  const orderIsMultiRx = flattenedFills.length > 1;
  return (!hideGlp1Prices && !orderIsMultiRx) ?? false;
}

const orgsThatHideGlp1Prices = ['org_QFoulY6Ornx7dMdw'];
