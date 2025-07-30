import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { patientAnalytics } from '../configs/analytics';
import { ApiObject } from '@rudderstack/analytics-js';
import { useOrderContext } from '../views/Main';

interface UsePageAnalyticsProps {
  pageName: string;
  properties?: ApiObject;
}

export const usePageAnalytics = ({ pageName, properties }: UsePageAnalyticsProps) => {
  const location = useLocation();
  const { order } = useOrderContext();

  useEffect(() => {
    if (order?.id) {
      patientAnalytics.page(location.pathname, pageName, {
        ...properties,
        orderId: order.id
      });
    }
  }, [location.pathname, pageName, properties, order?.id]);
};
