import { useEffect, useRef } from 'react';
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

  const onLoadProperties = useRef(properties);

  useEffect(() => {
    if (order?.id) {
      patientAnalytics.page(location.pathname, pageName, {
        ...onLoadProperties.current,
        orderId: order.id,
        organizationId: order.organization.id,
        organizationName: order.organization.name
      });

      patientAnalytics.track('Page Opened', order, {
        page_name: pageName
      });
    }
  }, [location.pathname, pageName, order?.id, order?.organization.id, order?.organization.name]);
};
