import { Alert, AlertDescription, AlertIcon, Container, Link } from '@chakra-ui/react';

interface UnverifiedUserAlertProps {
  supportEmail?: string;
}

export const UnverifiedUserAlert = ({ supportEmail }: UnverifiedUserAlertProps) => {
  return (
    <Container maxW="md" py="6">
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <AlertDescription fontSize="sm">
          Your identity or credentials couldn't be verified.
          {supportEmail && (
            <>
              {' '}
              Contact{' '}
              <Link
                href={`mailto:${supportEmail}`}
                textDecoration="underline"
                _before={{ display: 'none' }}
              >
                {supportEmail}
              </Link>{' '}
              for assistance.
            </>
          )}
        </AlertDescription>
      </Alert>
    </Container>
  );
};
