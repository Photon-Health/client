import { Alert, AlertDescription, AlertIcon, Container, Link, Text } from '@chakra-ui/react';

interface UnverifiedUserAlertProps {
  supportEmail?: string;
}

export const UnverifiedUserAlert = ({ supportEmail }: UnverifiedUserAlertProps) => {
  return (
    <Container maxW="md" py="6">
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <AlertDescription fontSize="sm">
          <Text fontWeight="bold">Your identity or credentials couldn't be verified.</Text>
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
