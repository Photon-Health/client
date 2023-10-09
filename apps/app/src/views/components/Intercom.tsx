import { usePhoton } from '@photonhealth/react';
import { useEffect } from 'react';

export const Intercom = () => {
  const { user } = usePhoton();

  useEffect(() => {
    if (user) {
      window.Intercom('boot', {
        api_base: 'https://api-iam.intercom.io',
        app_id: 'uqg0xvmw',
        name: user.name,
        email: user.email,
        org_id: user.org_id,
        application: 'clinical',
        test: true,
        test_string: 'test',
        test_number: 123
      });
    }
  }, [user]);

  return null;
};
