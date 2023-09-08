import {
  Box,
  Center,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Text,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { usePhoton } from '@photonhealth/react';
import { SelectField } from './SelectField';
import { RadioCard, RadioCardGroup } from './RadioCardGroup';
import { unique } from '../../utils';
import { gql, useLazyQuery } from '@apollo/client';
import { Medication, SearchMedication } from 'packages/sdk/dist/types';

const GET_CONCEPT = gql`
  query GetConcept($name: String!) {
    medicationConcepts(name: $name) {
      id
      name
    }
  }
`;

const GET_FORMS = gql`
  query GetForms($medId: String!) {
    medicationForms(id: $medId) {
      id
      form
    }
  }
`;

const GET_STRENGTHS = gql`
  query GetStrengths($medId: String!) {
    medicationStrengths(id: $medId) {
      id
      name
    }
  }
`;

const GET_ROUTES = gql`
  query GetRoutes($medId: String!) {
    medicationRoutes(id: $medId) {
      id
      name
    }
  }
`;

// const GET_PRODUCTS = gql`
//   query GetProducts($medId: String!) {
//     medicationProducts(id: $medId) {
//       id
//       name
//       brandName
//       manufacturer
//     }
//   }
// `;

type ConceptSelectProps = {
  setFilterText: (text: string) => void;
  filterText: string;
  setMedId: (id: string) => void;
};

const ConceptSelect = ({ setFilterText, filterText, setMedId }: ConceptSelectProps) => {
  const [searchConcepts, { data, loading }] = useLazyQuery(GET_CONCEPT);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (filterText.length > 0) {
      searchConcepts({ variables: { name: filterText } });
    }
  }, [filterText]);

  useEffect(() => {
    if (data && data.medicationConcepts) {
      setOptions(
        data.medicationConcepts.map((med: SearchMedication) => ({
          value: med.id,
          label: med.name
        }))
      );
    }
  }, [data]);

  return (
    <FormControl>
      <FormLabel>Medication Name</FormLabel>
      <SelectField
        name="medicationName"
        options={options}
        setFilterText={setFilterText}
        filterOption={() => true}
        placeholder="Search by name"
        onChange={(e: string) => {
          console.log(e);
          setMedId(e);
        }}
        isLoading={loading}
      />
    </FormControl>
  );
};

const ProductSelect = (props: any) => {
  const { medId, setSelected, selected, setAddToCatalog } = props;

  const { getMedicationProducts } = usePhoton();
  const { medicationProducts, loading, query } = getMedicationProducts({
    id: medId,
    defer: true
  });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const getConcepts = async () => {
      await query!({ id: medId });
    };
    if (medId) {
      getConcepts();
    }
  }, [medId]);

  useEffect(() => {
    if (medId) {
      const data = unique(medicationProducts, 'name').filter((x) => !x.controlled);
      data.sort((a: any, b: any) => (a.value > b.value ? 1 : -1));
      setProducts(data);
      if (selected) {
        setSelected(undefined);
        setAddToCatalog(false);
      }
    }
  }, [medicationProducts]);

  useEffect(() => () => setProducts([]), []);

  return (
    <Box>
      <Text color="gray.700" alignSelf="start" textAlign="left" pb={4}>
        Select a medication:
      </Text>
      {products.length === 0 && medId == null ? (
        <Text
          color="gray.400"
          alignSelf="start"
          maxHeight="200"
          fontStyle="italic"
          textAlign="left"
        >
          Please search using the options above
        </Text>
      ) : null}
      {products.length === 0 && medId != null && !loading ? (
        <Text
          color="gray.400"
          alignSelf="center"
          maxHeight="200"
          fontStyle="italic"
          textAlign="left"
        >
          No medications found
        </Text>
      ) : null}
      {loading ? (
        <Center>
          <CircularProgress isIndeterminate color="green.300" />
        </Center>
      ) : (
        <Stack spacing="5">
          <RadioCardGroup
            onChange={(e: any) => {
              const parts = e.split(', ');
              setSelected({
                id: parts[0],
                name: parts[1]
              });
            }}
          >
            {products.map((product) => (
              <RadioCard key={product.id} value={`${product.id}, ${product.name}`}>
                <Text color="muted" fontSize="sm">
                  {product.name}
                </Text>
              </RadioCard>
            ))}
          </RadioCardGroup>
        </Stack>
      )}
    </Box>
  );
};

const filters = {
  STRENGTH: {
    query: GET_STRENGTHS,
    key: 'medicationStrengths'
  },
  ROUTE: {
    query: GET_ROUTES,
    key: 'medicationRoutes'
  },
  FORM: {
    query: GET_FORMS,
    key: 'medicationForms'
  }
};

type filterType = keyof typeof filters;
type FilterSelectProps = {
  filterType: filterType;
  medId?: string;
  setMedId: (s: string | undefined) => void;
  isDisabled?: boolean;
};

const FilterSelect = ({ filterType, medId, setMedId, isDisabled }: FilterSelectProps) => {
  const { query, key } = filters[filterType];
  const [fetchData, { data, loading }] = useLazyQuery(query);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const selectInputRef = useRef<any>();

  useEffect(() => {
    if (medId) {
      fetchData({ variables: { medId } });
    }
  }, [medId]);

  useEffect(() => {
    if (data && data[key]) {
      setOptions(
        data[key].map((med: SearchMedication | Medication) => {
          const label = 'form' in med ? med.form : med.name;
          return {
            value: med.id,
            label: label
          };
        })
      );
    }
  }, [data]);
  return (
    <FormControl>
      <FormLabel>{filterType}</FormLabel>
      <SelectField
        name={filterType.toLowerCase()}
        ref={selectInputRef}
        options={options}
        onChange={setMedId}
        isDisabled={isDisabled}
        isLoading={loading}
      />
    </FormControl>
  );
};

type AdvancedDrugSearchProps = {
  submitRef: any;
  hideAddToCatalog?: boolean;
  loading?: boolean;
  forceMobile?: boolean;
};

export const AdvancedDrugSearch = ({
  submitRef,
  hideAddToCatalog,
  loading,
  forceMobile
}: AdvancedDrugSearchProps) => {
  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText] = useDebounce(filterText, 350);
  const [medId, setMedId] = useState<string | undefined>();
  const [selected, setSelected] = useState<any>();
  const [addToCatalog, setAddToCatalog] = useState<boolean>(false);

  const isMobile = useBreakpointValue({ base: true, md: false }) || forceMobile;

  useEffect(() => {
    if (submitRef && submitRef.current) {
      if (selected) {
        submitRef.current.disabled = false;
      } else {
        submitRef.current.disabled = true;
      }
    }
  }, [submitRef, selected]);

  useEffect(() => () => setSelected(undefined), []);

  return (
    <VStack align="stretch">
      <Stack flexDir={isMobile ? 'column' : 'row'} gap="2" alignItems="flex-end">
        <ConceptSelect
          filterText={debouncedFilterText}
          setFilterText={setFilterText}
          setMedId={setMedId}
        />
        <FilterSelect medId={medId} filterType="FORM" setMedId={setMedId} isDisabled={!medId} />
      </Stack>
      <Stack pt={2} flexDir={isMobile ? 'column' : 'row'} gap="2" alignItems="flex-end">
        <FilterSelect medId={medId} filterType="STRENGTH" setMedId={setMedId} isDisabled={!medId} />
        <FilterSelect medId={medId} filterType="ROUTE" setMedId={setMedId} isDisabled={!medId} />
      </Stack>
      <Divider pt={8} />
      <Box pt={6} pb={4}>
        <ProductSelect
          medId={medId}
          setSelected={setSelected}
          selected={selected}
          setAddToCatalog={setAddToCatalog}
        />
      </Box>
      {!hideAddToCatalog ? (
        <Box pb={isMobile ? 12 : 0}>
          <Checkbox
            isDisabled={!selected || loading}
            isChecked={addToCatalog}
            onChange={() => setAddToCatalog(!addToCatalog)}
          >
            <Text>Add Medication to Catalog</Text>
          </Checkbox>
        </Box>
      ) : null}
    </VStack>
  );
};
