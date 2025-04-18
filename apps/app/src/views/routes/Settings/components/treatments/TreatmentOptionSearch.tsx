import { Box, InputGroup, InputRightElement, Spinner, VStack, Text } from '@chakra-ui/react';

import { OptionProps } from 'chakra-react-select';
import { useEffect, useState } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { useDebounce } from 'use-debounce';
import { SelectField } from '../../../../components/SelectField';
import { getMatchingPartsFromSubstring } from '../../../../../utils';

export const SearchTreatmentOptionsQuery = gql`
  query SearchTreatments($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      id
      name
    }
  }
`;

type SelectedTreatment = {
  id: string;
  name: string;
};

type TreatmentOptionSearchProps = {
  setSelectedTreatment: (s: SelectedTreatment | undefined) => void;
};

interface TreatmentOptionsOptionProps extends OptionProps {
  data: {
    searchTerm: string;
  };
}

const Option = ({ innerProps, label, data }: TreatmentOptionsOptionProps) => (
  <VStack
    {...innerProps}
    alignItems="left"
    _hover={{ bg: 'gray.100' }}
    p={3}
    cursor="pointer"
    title={label}
  >
    <Box ms={4}>
      <Text as="b" fontWeight={500}>
        {getMatchingPartsFromSubstring(label, data.searchTerm).map(({ part, matches }, index) => {
          if (matches) {
            return <strong key={index}>{part}</strong>;
          } else {
            return part;
          }
        })}
      </Text>
    </Box>
  </VStack>
);

export const TreatmentOptionSearch = ({
  setSelectedTreatment: setSelectedTreatment
}: TreatmentOptionSearchProps) => {
  const client = usePhoton();
  const [searchTerm, setSearchTerm] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const [treatments, setTreatments] = useState<Array<{ value: string; label: string }>>();

  const clinicalClient = useApolloClient(client?.clinicalClient);

  const [searchTermDebounce] = useDebounce(searchTerm, 200);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const { data } = await clinicalClient.query({
          query: SearchTreatmentOptionsQuery,
          variables: { filter: { term: searchTermDebounce } }
        });

        setTreatments(
          data.treatments?.map((treatmentOption: { id: string; name: string }) => ({
            value: treatmentOption.id,
            label: treatmentOption.name,
            searchTerm: searchTermDebounce
          }))
        );
      } catch (err) {
        setLoading(false);
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };

    if (searchTermDebounce) {
      fetchData();
    }
  }, [searchTermDebounce, clinicalClient]);

  const handleSearchTermChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleSelectedTreatmentChange = (selectedTreatmentId: string) => {
    const searchTerms = treatments?.filter(
      (treatmentOption) => treatmentOption.value === selectedTreatmentId
    );

    if (!searchTerms) {
      return;
    }

    const treatment = { id: selectedTreatmentId, name: searchTerms[0].label };

    setSelectedTreatment(treatment);
  };

  return (
    <Box>
      <InputGroup>
        {loading && (
          <InputRightElement>
            <Spinner size="sm" />
          </InputRightElement>
        )}
      </InputGroup>

      <SelectField
        name="treatmentOption"
        placeholder={'Search for Treatments'}
        onChange={handleSelectedTreatmentChange}
        setFilterText={handleSearchTermChange}
        filterText={searchTermDebounce}
        isLoading={loading}
        options={treatments}
        components={{ Option }}
        filterOption={() => true}
      />

      {error && (
        <Box color="red.500" mt={2}>
          {error}
        </Box>
      )}
    </Box>
  );
};
