import { Box, FormControl, FormLabel, HStack, FormErrorMessage } from '@chakra-ui/react';

import { MedicationSelect } from '../../../../../../components/MedicationSelect';

export const Treatment = ({
  errors,
  touched,
  edit,
  values,
  medicationSelectRef,
  catalogId
}: {
  catalogId: string;
  errors: any;
  touched: any;
  edit: any;
  values: any;
  medicationSelectRef: any;
}) => (
  <HStack align="flex-start" spacing={4}>
    <FormControl isInvalid={!!errors.treatment && !!touched.treatment}>
      <FormLabel htmlFor="treatment">Treatment</FormLabel>
      {edit ? (
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          bgColor="gray.50"
          px={4}
          py={2}
          cursor="not-allowed"
        >
          {values.treatment.name}
        </Box>
      ) : (
        <MedicationSelect
          hideTemplates
          hideExpandedSearch
          ref={medicationSelectRef}
          name="treatment"
          catalogId={catalogId}
        />
      )}
      <FormErrorMessage>{errors.treatment?.id}</FormErrorMessage>
    </FormControl>
  </HStack>
);
