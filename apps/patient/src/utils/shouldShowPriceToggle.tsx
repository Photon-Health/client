import { FillWithCount } from './general';
import { Order } from './models';
import { isGLP } from './isGLP';

export function shouldShowPriceToggle(flattenedFills: FillWithCount[], order: Order): boolean {
  const hideGlp1Prices = shouldHideGlp1Prices(flattenedFills, order.organization.id);
  return !hideGlp1Prices;
}

function shouldHideGlp1Prices(flattenedFills: FillWithCount[], organizationId: string) {
  const isOrgThatHidesGlp1Prices = orgsThatHideGlp1Prices.includes(organizationId);
  const hasGlp1 = flattenedFills.some((fill) => isGLP(fill.treatment.name));
  return isOrgThatHidesGlp1Prices && hasGlp1;
}

const orgsThatHideGlp1Prices = ['org_QFoulY6Ornx7dMdw', 'org_hidesGlp1Prices'];
