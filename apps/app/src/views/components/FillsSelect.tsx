import { useField } from 'formik';
import {
  Box,
  Checkbox,
  CheckboxGroup,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react';

import { usePhoton } from '@photonhealth/react';
import { useEffect, useRef, useState } from 'react';
import { formatDate } from '../../utils';
import { LoadingInputField } from './LoadingInputField';

interface FillsSelectProps {
  name: string;
  patientId: string;
  initialFills?: string[];
}

export const FillsSelect = (props: FillsSelectProps) => {
  const { patientId, name, initialFills } = props;

  const [, , { setValue }] = useField(name);
  const [selected, setSelected] = useState<any[]>(initialFills ?? []);

  const [finished, setFinished] = useState<boolean>(false);
  const [options, setOptions] = useState<any[]>([]);

  const { getPrescriptions } = usePhoton();

  const mapOption = (script: any) => {
    const effective = formatDate(script.effectiveDate);
    const expires = formatDate(script.expirationDate);
    return {
      value: {
        treatmentId: script.treatment.id,
        prescriptionId: script.id
      },
      treatment: `${script.treatment.name}`,
      fillsRemaining: `${script.fillsRemaining}`,
      fillsAllowed: `${script.fillsAllowed}`,
      effective: `${effective}`,
      expires: `${expires}`
    };
  };
  const { prescriptions, loading, error, refetch } = getPrescriptions({
    patientId,
    // @ts-ignore
    state: 'ACTIVE'
  });

  const matchSelectedPatient = (prescription: { patient: { id: string } }) =>
    prescription.patient.id === patientId;

  useEffect(() => {
    if (!loading && patientId && prescriptions.every(matchSelectedPatient)) {
      setOptions(prescriptions.map(mapOption));
      setFinished(true);
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && patientId && prescriptions.every(matchSelectedPatient)) {
      setOptions(prescriptions.map(mapOption));
      setFinished(true);
    }
  }, [prescriptions]);

  useEffect(() => {
    setValue(selected.map((prescriptionId) => ({ prescriptionId })));
  }, [selected]);

  if (error) return <Text color="red">{error.message}</Text>;

  const fetchMoreData = async () => {
    if (patientId && !loading) {
      const { data } = await refetch({
        patientId,
        // @ts-ignore
        state: 'ACTIVE',
        after: options?.at(-1)?.value.prescriptionId
      });
      if (data?.prescriptions.length === 0) {
        setFinished(true);
      }
      if (data.prescriptions.every(matchSelectedPatient)) {
        setOptions([...new Set(options.concat(data?.prescriptions.map(mapOption)))]);
        setFinished(true);
      }
    }
  };

  const listInnerRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      if (scrollTop + clientHeight === scrollHeight) {
        fetchMoreData();
      }
    }
  };

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (patientId && !loading && finished) {
    return (
      <Box
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        overflowY="auto"
        maxHeight="25vh"
        onScroll={() => onScroll()}
        ref={listInnerRef}
      >
        {options.length > 0 ? (
          <Table size="sm">
            <Tbody>
              <CheckboxGroup size="lg" defaultValue={initialFills} onChange={setSelected}>
                {/* TODO: We should really handle this a bit definitely from a semantic perspective */}
                {options
                  .filter((opt) => opt.fillsRemaining > 0)
                  .map((opt: any) => (
                    <Tr key={opt.value.prescriptionId + opt.value.treatmentId}>
                      <Td paddingRight="0">
                        <Checkbox size="lg" value={opt.value.prescriptionId} name={name} />
                      </Td>
                      <Td whiteSpace="pre-wrap">
                        <Box minWidth={150} textOverflow="ellipsis">
                          {opt.treatment}
                        </Box>
                      </Td>
                      <Td isNumeric>{opt.fillsRemaining}</Td>
                      <Td>{opt.effective}</Td>
                    </Tr>
                  ))}
              </CheckboxGroup>
            </Tbody>
            <Thead position="sticky" top={0}>
              <Tr borderTop="unset">
                <Th borderTop="unset" />
                <Th borderTop="unset">Treatment</Th>
                <Th borderTop="unset">Fills</Th>
                <Th borderTop="unset">Effective</Th>
              </Tr>
            </Thead>
          </Table>
        ) : (
          <Text fontSize="1rem" paddingX="4" paddingY="2" color="gray.400">
            The patient you selected has no prescriptions.
          </Text>
        )}
      </Box>
    );
  }

  return (
    <LoadingInputField
      disabled
      displayOnly
      loading={(patientId && loading) || (patientId && !finished) ? 1 : 0}
    />
  );
};

FillsSelect.defaultProps = {
  initialFills: []
};
