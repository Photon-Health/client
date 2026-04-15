import { useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { ApiObject } from '@rudderstack/analytics-js';
import { OrderContext } from '../views/Main';
import { usePatientAnalytics } from './usePatientAnalytics';

interface UsePageAnalyticsProps {
  pageName: string;
  properties?: ApiObject;
}

export const usePageAnalytics = ({ pageName, properties }: UsePageAnalyticsProps) => {
  const location = useLocation();
  const orderContext = useContext(OrderContext);
  const order = orderContext?.order;
  const patientAnalytics = usePatientAnalytics();

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
        page_name: pageName,
        ...properties
      });
    }
  }, [location.pathname, pageName, order?.id, order?.organization.id, order?.organization.name]);
};
