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
import { SelectField } from './SelectField';
import { RadioCard, RadioCardGroup } from './RadioCardGroup';
import { gql, useLazyQuery } from '@apollo/client';
import { Medication, SearchMedication } from 'packages/sdk/dist/types';
import { SelectedProduct } from '../routes/Settings/components/TreatmentForm';
import { uniq, uniqBy } from 'lodash';

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

const GET_PRODUCTS = gql`
  query GetProducts($medId: String!) {
    medicationProducts(id: $medId) {
      id
      name
      controlled
    }
  }
`;

type ConceptSelectProps = {
  setFilterText: (text: string) => void;
  filterText: string;
  setMedId: (id: string | undefined) => void;
};

const ConceptSelect = ({ setFilterText, filterText, setMedId }: ConceptSelectProps) => {
  const [searchConcepts, { data, loading }] = useLazyQuery(GET_CONCEPT);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (filterText.length > 0) {
      setMedId(undefined);
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
        onChange={(id: string) => {
          setMedId(undefined);
          setMedId(id);
        }}
        isLoading={loading}
      />
    </FormControl>
  );
};

type ProductSelectProps = {
  medId?: string;
  setAddToCatalog: (s: boolean) => void;
  selectedProduct?: SelectedProduct;
  setSelectedProduct: (s: SelectedProduct | undefined) => void;
};

const ProductSelect = ({
  medId,
  setAddToCatalog,
  selectedProduct,
  setSelectedProduct
}: ProductSelectProps) => {
  const [getProducts, { data, loading }] = useLazyQuery<{
    medicationProducts: Medication[];
  }>(GET_PRODUCTS);

  const [products, setProducts] = useState<Medication[]>([]);

  useEffect(() => {
    if (medId) {
      getProducts({ variables: { medId } });
    }
  }, [medId]);

  useEffect(() => {
    if (medId && data?.medicationProducts) {
      const medications = data.medicationProducts;
      const uniqueProducts = uniqBy(medications, 'name').filter((med) => !med.controlled);

      setProducts(uniqueProducts);
      if (selectedProduct) {
        setSelectedProduct(undefined);
        setAddToCatalog(false);
      }
    }
  }, [data]);

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
            onChange={(e: string) => {
              const parts = e.split(', ');
              setSelectedProduct({
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
  conceptId?: string;
  setMedId: (s: string | undefined) => void;
  isDisabled?: boolean;
};

const FilterSelect = ({
  filterType,
  medId,
  setMedId,
  conceptId,
  isDisabled
}: FilterSelectProps) => {
  const { query, key } = filters[filterType];
  const [fetchData, { data, loading }] = useLazyQuery(query);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [filterSet, setFilterSet] = useState<boolean>(false);
  const selectInputRef = useRef<any>();
  const prevConceptIdRef = useRef<string | undefined>();

  useEffect(() => {
    if (conceptId !== prevConceptIdRef.current) {
      setFilterSet(false);
      setOptions([]);
      prevConceptIdRef.current = conceptId;
    }
    if (medId) {
      if (!filterSet) {
        fetchData({ variables: { medId } });
      }
    }
  }, [medId, filterSet, conceptId]);

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
      <FormLabel>
        {filterType.charAt(0).toUpperCase() + filterType.slice(1).toLowerCase()}
      </FormLabel>
      <SelectField
        name={filterType.toLowerCase()}
        ref={selectInputRef}
        options={options}
        onChange={(id: string) => {
          setMedId(id);
          setFilterSet(true);
        }}
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
  selectedProduct?: SelectedProduct;
  setSelectedProduct: (s: SelectedProduct | undefined) => void;
};

export const AdvancedDrugSearch = ({
  hideAddToCatalog,
  loading,
  forceMobile,
  selectedProduct,
  setSelectedProduct
}: AdvancedDrugSearchProps) => {
  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText] = useDebounce(filterText, 350);
  const [conceptId, setConceptId] = useState<string | undefined>();
  const [medId, setMedId] = useState<string | undefined>();
  const [addToCatalog, setAddToCatalog] = useState<boolean>(false);

  const isMobile = useBreakpointValue({ base: true, md: false }) || forceMobile;

  return (
    <VStack align="stretch">
      <Stack flexDir={isMobile ? 'column' : 'row'} gap="2" alignItems="flex-end">
        <ConceptSelect
          filterText={debouncedFilterText}
          setFilterText={setFilterText}
          setMedId={(id) => {
            setConceptId(id);
            setMedId(id);
          }}
        />
        <FilterSelect
          conceptId={conceptId}
          medId={medId}
          filterType="FORM"
          setMedId={setMedId}
          isDisabled={!medId}
        />
      </Stack>
      <Stack pt={2} flexDir={isMobile ? 'column' : 'row'} gap="2" alignItems="flex-end">
        <FilterSelect
          conceptId={conceptId}
          medId={medId}
          filterType="STRENGTH"
          setMedId={setMedId}
          isDisabled={!medId}
        />
        <FilterSelect
          conceptId={conceptId}
          medId={medId}
          filterType="ROUTE"
          setMedId={setMedId}
          isDisabled={!medId}
        />
      </Stack>
      <Divider pt={8} />
      <Box pt={6} pb={4}>
        <ProductSelect
          medId={medId}
          setAddToCatalog={setAddToCatalog}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />
      </Box>
      {!hideAddToCatalog ? (
        <Box pb={isMobile ? 12 : 0}>
          <Checkbox
            isDisabled={!selectedProduct || loading}
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
