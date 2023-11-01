import { usePhoton } from '@photonhealth/react';
import { useEffect } from 'react';

type Env = 'boson' | 'neutron' | 'photon';
function getEnvironmentFromUrl(): Env {
  const url = window.location.href.toLowerCase();

  let env: Env = 'boson';
  if (url.includes('neutron')) {
    env = 'neutron';
  } else if (url.includes('photon')) {
    env = 'photon';
  }

  return env;
}

export const Zendesk = () => {
  const { user } = usePhoton();

  useEffect(() => {
    if (user && window?.zE) {
      // zendesk fields are set https://photonhealthhelp.zendesk.com/admin/objects-rules/tickets/ticket-fields
      // grab the field id, then you can set the value here
      window.zE('messenger:set', 'conversationTags', ['clinical']);
      window.zE('messenger:set', 'conversationFields', [
        {
          // Organization
          id: '22439531168787',
          value: user.org_id
        },
        {
          // Customer Name
          id: '22447880359059',
          value: user.name
        },
        {
          // Customer Email
          id: '22448017838483',
          value: user.email
        },
        {
          // Environment
          id: '22448619079059',
          value: getEnvironmentFromUrl()
        }
      ]);
    }
  }, [user]);

  return null;
};
