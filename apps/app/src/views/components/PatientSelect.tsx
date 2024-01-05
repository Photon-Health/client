import { Text } from '@chakra-ui/react';

import { usePhoton } from 'packages/react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { SelectField } from './SelectField';

const mapOption = (patient: any) => ({ value: patient.id, label: patient.name.full });

export const PatientSelect = (props: any) => {
  const [filterText, setFilterText] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [filterTextDebounce] = useDebounce(filterText, 250);
  const { getPatients, getPatient } = usePhoton();

  const { patients, loading, error, refetch } = getPatients({
    name: filterTextDebounce.length > 0 ? filterTextDebounce : null
  });

  const patient = getPatient({ id: '' });

  useEffect(() => {
    if (!loading) {
      setOptions(patients.map(mapOption));
      setFinished(patients.length === 0);
    }
  }, [loading]);

  if (error) return <Text color="red">{error.message}</Text>;

  return (
    <SelectField
      {...props}
      isLoading={loading}
      options={options}
      paginated
      onFormPopulated={async (x?: string) => {
        if (x && x.length > 0 && !options.map((y: any) => y.value).includes(x)) {
          const patientData = await patient.refetch({
            id: x
          });
          if (patientData.data) {
            setOptions([...new Set(options.concat(mapOption(patientData.data?.patient)))]);
          }
        }
      }}
      filterText={filterText}
      setFilterText={setFilterText}
      hasMore={options.length % 25 === 0 && !finished}
      fetchMoreData={async () => {
        const { data } = await refetch({
          name: filterTextDebounce.length > 0 ? filterTextDebounce : undefined,
          after: options?.at(-1)?.value
        });
        if (data?.patients.length === 0) {
          setFinished(true);
        }
        setOptions([...new Set(options.concat(data?.patients.map(mapOption)))]);
      }}
    />
  );
};
