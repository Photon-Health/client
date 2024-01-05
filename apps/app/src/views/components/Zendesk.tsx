import { usePhoton } from 'packages/react';
import { useEffect } from 'react';

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
          value: process.env.REACT_APP_ENV_NAME
        }
      ]);
    }
  }, [user]);

  return null;
};
