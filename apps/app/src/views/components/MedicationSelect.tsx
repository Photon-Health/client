import { Box, Text, VStack, forwardRef } from '@chakra-ui/react';

import { GroupHeadingProps, OptionProps as SelectOptionProps } from 'chakra-react-select';
import { useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { useEffect, useImperativeHandle, useState } from 'react';
import { SelectField } from './SelectField';
import { graphql } from '../../gql';
import { CatalogTreatmentFieldsMap } from '../../model/fragments';

const SearchTreatmentOptionsQuery = graphql(/* GraphQL */ `
  query SearchTreatmentOptions($searchTerm: String!) {
    treatmentOptions(searchTerm: $searchTerm) {
      id: medicationId
      form
      name
      ndc
      route
      strength
      type
      __typename
    }
  }
`);

interface OptionProps extends SelectOptionProps {
  data: {
    selectGroupLabel: string;
    dispenseQuantity: number;
    dispenseUnit: string;
    daysSupply: number;
    fillsAllowed: number;
    instructions: string;
  };
}

const Option = ({ innerProps, label, data }: OptionProps) => (
  <VStack
    {...innerProps}
    alignItems="left"
    _hover={{ bg: 'gray.100' }}
    p={3}
    cursor="pointer"
    title={label}
  >
    <Box ms={4} textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
      <Text as="b" fontWeight={500}>
        {label}
      </Text>
      {data.selectGroupLabel === 'Templates' && (
        <Box ps={4}>
          <Text fontSize="sm" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
            QTY: {data.dispenseQuantity} {data.dispenseUnit}&nbsp;|&nbsp;Days Supply:&nbsp;
            {data.daysSupply}
            {/* Theres a -1 here because we are showing the number of Refills to keep the template creation form consistent with the prescribing form */}
            &nbsp;|&nbsp;Refills: {data.fillsAllowed - 1}&nbsp;|&nbsp;Sig: {data.instructions}
          </Text>
        </Box>
      )}
    </Box>
  </VStack>
);

const GroupHeading = ({ data }: GroupHeadingProps) => (
  <Box
    backgroundColor="gray.50"
    borderTop="1px"
    borderBottom="1px"
    borderColor="gray.100"
    py={1}
    ps={3}
  >
    <Text color="black" fontSize="sm">
      {data.label}
    </Text>
  </Box>
);

export const MedicationSelect = forwardRef((props: any, ref: any) => {
  const { catalogId, linkedMedRef, onNotInCatalog, hideExpandedSearch } = props;
  const { getCatalog, addToCatalog, clinicalClient } = usePhoton();
  const [filterText, setFilterText] = useState('');
  // By using a useState for options, we can hide options we don't want to show until
  // other conditions (loading) are true
  const [treatmentOptions, setTreatmentOptions] = useState<Array<{ value: string; label: string }>>(
    []
  );

  const { data: offCatalogTreatments } = useQuery(SearchTreatmentOptionsQuery, {
    client: clinicalClient,
    variables: { searchTerm: filterText },
    skip: filterText.length <= 2
  });

  const [addToCatalogMutation] = addToCatalog({
    refetchQueries: ['getCatalog'],
    awaitRefetchQueries: true,
    refetchArgs: {
      id: catalogId,
      fragment: CatalogTreatmentFieldsMap
    }
  });

  useImperativeHandle(linkedMedRef, () => ({
    addToCatalog: ({ id, onComplete }: { id: string; onComplete: (data: any) => void }) => {
      addToCatalogMutation({
        variables: {
          catalogId,
          treatmentId: id
        },
        onCompleted: onComplete
      });
    }
  }));

  const catalog = getCatalog({
    id: catalogId,
    fragment: CatalogTreatmentFieldsMap
  });

  useEffect(() => {
    if (!catalog.loading && catalog.catalog) {
      const catalogOptions = catalog.catalog.treatments.map((med: any) => ({
        value: med,
        label: `${med.name}`,
        selectGroupLabel: 'Treatments'
      }));

      const offCatalogOptions =
        offCatalogTreatments?.treatmentOptions.map((med: any) => ({
          value: med,
          label: `${med.name}`,
          selectGroupLabel: 'Treatments'
        })) || [];

      setTreatmentOptions(
        [...catalogOptions, ...offCatalogOptions].sort((a, b) => a.label.localeCompare(b.label))
      );
    }
  }, [catalog.loading, catalog.catalog, offCatalogTreatments]);

  if (catalog.error?.message) {
    return <Text color="red">{catalog.error.message}</Text>;
  }

  return (
    <SelectField
      {...props}
      ref={ref}
      filterText={filterText}
      setFilterText={setFilterText}
      expandedSearch={!hideExpandedSearch}
      expandedSearchLabel="Advanced Search"
      expandedSearchNoResultsLabel={`No matches for '${filterText}' in catalog`}
      onExpandedSearchClick={onNotInCatalog}
      isLoading={catalog.loading && catalogId != null}
      options={treatmentOptions}
      components={{ Option, GroupHeading }}
      isClearable
    />
  );
});
