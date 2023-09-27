import { usePhoton } from '@photonhealth/react';
import { bootIntercom } from '../../intercomManager';
import { useEffect } from 'react';

export const Intercom = () => {
  const { user } = usePhoton();

  useEffect(() => {
    if (user) {
      bootIntercom(user?.name, user?.email, user?.org_id);
    }
  }, [user]);

  return null;
};
