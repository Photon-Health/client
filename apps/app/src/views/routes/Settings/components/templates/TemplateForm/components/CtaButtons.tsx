import { Button, HStack } from '@chakra-ui/react';

interface CtaButtonProps {
  edit?: boolean;
  handleCancel: () => void;
  loading: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}

export const CtaButtons = ({
  edit,
  handleCancel,
  loading,
  isSubmitting,
  isValid
}: CtaButtonProps) => (
  <HStack alignSelf="end">
    <Button variant="outline" onClick={handleCancel} isLoading={loading && isSubmitting}>
      Cancel
    </Button>
    <Button
      type="submit"
      colorScheme="brand"
      form="template-builder"
      disabled={loading}
      isDisabled={loading || !isValid}
      isLoading={loading || isSubmitting}
      loadingText="Saving template"
    >
      {edit ? 'Save Changes' : 'Create Template'}
    </Button>
  </HStack>
);
