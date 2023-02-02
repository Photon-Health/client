import { Button, HStack } from '@chakra-ui/react'

export const CtaButtons = ({
  edit,
  handleCancel,
  loading,
  isSubmitting,
  setSubmitting,
  catalogs
}: any) => (
  <HStack alignSelf="end">
    <Button variant="outline" onClick={handleCancel} isLoading={loading && isSubmitting}>
      Cancel
    </Button>
    <Button
      type="submit"
      colorScheme="brand"
      form="template-builder"
      onClick={() => setSubmitting(true)}
      disabled={loading || catalogs.loading}
      isLoading={loading && isSubmitting}
      loadingText="Saving template"
    >
      {edit ? 'Save Changes' : 'Create Template'}
    </Button>
  </HStack>
)
