import { useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { StyledToast } from '../views/components/StyledToast';
import { usePhoton } from '@photonhealth/react';

export function useWelcomeToast() {
  const { user } = usePhoton();
  const toast = useToast();

  useEffect(() => {
    console.log('Checked selfSignupInitialLogin', localStorage.getItem('selfSignupInitialLogin'));
    const isInitialLogin = localStorage.getItem('selfSignupInitialLogin') === 'true';

    if (user && isInitialLogin) {
      console.log('Got user and its the first login!');
      toast({
        position: 'top',
        duration: 5_000,
        containerStyle: {
          // for full width on mobile
          width: { base: '95%', md: 'auto' },
          maxWidth: { base: '95%', md: '24rem' }
        },
        render: ({ onClose }) => (
          <StyledToast
            onClose={onClose}
            type="success"
            title={`Welcome ${user.given_name}!`}
            description="Add a patient to get started"
          />
        )
      });

      console.log('Clearing the local storage value!');
      localStorage.removeItem('selfSignupInitialLogin');
    }
  }, [toast, user]);
}
