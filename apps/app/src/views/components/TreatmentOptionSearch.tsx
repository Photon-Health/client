import { Box, ChakraProvider, InputGroup, InputRightElement, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { useDebounce } from 'use-debounce';
import { SelectField } from './SelectField';

const SearchTreatmentOptionsQuery = gql`
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
`;

type SelectedTreatment = {
  medicineId: string;
  name: string;
};

type TreatmentOptionSearchProps = {
  setSelectedTreatment: (s: SelectedTreatment | undefined) => void;
};

export const TreatmentOptionSearch = ({
  setSelectedTreatment: setSelectedTreatment
}: TreatmentOptionSearchProps) => {
  const client = usePhoton();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [treatmentOptions, setTreatmentOptions] =
    useState<Array<{ value: string; label: string }>>();

  const clinicalClient = useApolloClient(client?.clinicalClient);

  const [searchTermDebounce] = useDebounce(searchTerm, 800);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await clinicalClient.query({
          query: SearchTreatmentOptionsQuery,
          variables: { searchTerm: searchTermDebounce }
        });

        setTreatmentOptions(
          data.treatmentOptions?.map((treatmentOption: { id: string; name: string }) => ({
            value: treatmentOption.id,
            label: treatmentOption.name
          }))
        );
      } catch (err) {
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
    const searchTerms = treatmentOptions?.filter(
      (treatmentOption) => treatmentOption.value === selectedTreatmentId
    );

    if (!searchTerms) {
      return;
    }

    const treatment = { medicineId: selectedTreatmentId, name: searchTerms[0].label };

    setSelectedTreatment(treatment);
  };

  return (
    <ChakraProvider>
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
          filterText={searchTerm}
          setFilterText={handleSearchTermChange}
          isLoading={loading}
          options={treatmentOptions}
        />

        {error && (
          <Box color="red.500" mt={2}>
            {error}
          </Box>
        )}
      </Box>
    </ChakraProvider>
  );
};
