import { Alert, AlertDescription, AlertIcon, Container, Link, Text } from '@chakra-ui/react';

interface UnverifiedUserAlertProps {
  supportEmail?: string;
}

export const UnverifiedUserAlert = ({ supportEmail }: UnverifiedUserAlertProps) => {
  return (
    <Container maxW="lg" marginY="8">
      <Alert status="error">
        <AlertIcon />
        <AlertDescription fontSize="sm">
          Your identity or prescribing credentials haven't been verified, so you can't access this
          page
        </AlertDescription>
      </Alert>
      {supportEmail && (
        <Text fontSize="sm" marginY="4" textAlign="center">
          <span>
            Please reach out to{' '}
            <Link
              href={`mailto:${supportEmail}`}
              textDecoration="underline"
              _before={{ display: 'none' }}
            >
              {supportEmail}
            </Link>{' '}
            if you believe this is an error or need help completing verification
          </span>
        </Text>
      )}
    </Container>
  );
};
