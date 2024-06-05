import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  Wrap
} from '@chakra-ui/react';
import { Field, Formik } from 'formik';
import { MutableRefObject, useEffect, useState } from 'react';
import { SelectField } from '../SelectField';
import {
  calculateDosage,
  calculateLiquidDosage,
  DosageUnits,
  dosageUnits,
  LiquidVolumeUnits,
  LiquidDosageUnits,
  ValueWithUnits,
  WeightUnits
} from './conversionFactors';

interface DosageCalcInputs {
  input: {
    dosage: ValueWithUnits<DosageUnits>;
    weight: ValueWithUnits<WeightUnits>;
  };
  liquid_formation: {
    drug_amount: ValueWithUnits<LiquidDosageUnits>;
    per_volume: ValueWithUnits<LiquidVolumeUnits>;
  };
}

const initialValues: DosageCalcInputs = {
  input: {
    dosage: { value: 0, unit: 'mg/kg' } as ValueWithUnits<DosageUnits>,
    weight: { value: 0, unit: 'lb' } as ValueWithUnits<WeightUnits>
  },
  liquid_formation: {
    drug_amount: { value: 0, unit: 'mg' } as ValueWithUnits<LiquidDosageUnits>,
    per_volume: { value: 0, unit: 'mL' } as ValueWithUnits<LiquidVolumeUnits>
  }
};

export interface DosageCalcProps {
  isOpen: boolean;
  onClose: () => void;
  quantityRef: MutableRefObject<any>;
  drugRef: MutableRefObject<any>;
  unitRef: MutableRefObject<any>;
}

export const DosageCalc = ({ isOpen, onClose, quantityRef, drugRef, unitRef }: DosageCalcProps) => {
  const background = useColorModeValue('white', 'dark');
  const [dose, setDose] = useState<string | undefined>();
  const [liquidDose, setLiquidDose] = useState<string | undefined>();
  const [selectedMedication, setSelectedMedication] = useState<string>('');

  useEffect(() => {
    if (drugRef.current) {
      const val = drugRef.current?.getValue();
      if (val.length > 0) {
        setSelectedMedication(val[0]?.label);
      } else {
        setSelectedMedication('');
      }
    }
  }, [drugRef, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      size="xl"
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex flex="1 1 0">
            <Text textAlign="center" flex="1">
              Dosage Calculator
            </Text>
            <Box flex="1" />
            <Box flex="1" textAlign="right">
              <Wrap spacing={2} justify="right" />
            </Box>
            <ModalCloseButton right="4" top="4" left="unset" onClick={onClose} />
          </Flex>
        </ModalHeader>
        <ModalBody padding={0}>
          <Formik<DosageCalcInputs>
            initialValues={initialValues}
            onSubmit={() => {}}
            validate={(values) => {
              const dosage = calculateDosage(values.input.dosage, values.input.weight);
              const liquidDosage = calculateLiquidDosage(
                values.input.dosage,
                values.liquid_formation.drug_amount,
                values.liquid_formation.per_volume
              );
              setDose(
                `${dosage.toFixed(4).replaceAll(/0+$/, '')} ${
                  values.input.dosage.unit.split('/')[0]
                }`
              );
              setLiquidDose(
                `${liquidDosage.toFixed(4).replaceAll(/0+$/, '')} ${
                  values.liquid_formation.per_volume.unit
                }`
              );
            }}
          >
            {() => {
              return (
                <Flex justifyContent="center">
                  <Box width="xl" background={background} padding="8" pt={4}>
                    <Text fontSize={18} fontWeight="medium" pb={2} display="flex">
                      Selected Drug:{' '}
                      {selectedMedication.length > 0 ? (
                        <Text fontWeight="normal" pl={2}>
                          {selectedMedication}
                        </Text>
                      ) : (
                        <Text fontStyle="italic" color="gray.500" pl={2}>
                          None selected
                        </Text>
                      )}
                    </Text>
                    <Text fontSize={16} fontWeight="medium" pb={2}>
                      Input
                    </Text>
                    <HStack pb={4}>
                      <FormLabel minW="88px">Dosage</FormLabel>
                      <FormControl>
                        <Field as={Input} name="input.dosage.value" type="number" />
                      </FormControl>
                      <FormControl>
                        <SelectField
                          name="input.dosage.unit"
                          options={dosageUnits.map((u) => ({ value: u, label: u }))}
                        />
                      </FormControl>
                    </HStack>
                    <HStack>
                      <FormLabel minW="88px">Weight</FormLabel>
                      <FormControl>
                        <Field as={Input} name="input.weight.value" type="number" />
                      </FormControl>
                      <FormControl>
                        <SelectField
                          name="input.weight.unit"
                          options={[
                            {
                              value: 'lb',
                              label: 'lbs'
                            },
                            {
                              value: 'kg',
                              label: 'kgs'
                            }
                          ]}
                        />
                      </FormControl>
                    </HStack>
                    <Text fontSize={15} fontWeight="medium" pt={4} pb={2}>
                      Liquid Formation
                    </Text>
                    <HStack pb={4}>
                      <FormLabel minW="88px">Drug Amount</FormLabel>
                      <FormControl>
                        <Field as={Input} name="liquid_formation.drug_amount.value" type="text" />
                      </FormControl>
                      <FormControl>
                        <SelectField
                          name="liquid_formation.drug_amount.unit"
                          options={[
                            {
                              value: 'mg',
                              label: 'mg'
                            },
                            {
                              value: 'mcg',
                              label: 'mcg'
                            },
                            {
                              value: 'g',
                              label: 'grams'
                            }
                          ]}
                        />
                      </FormControl>
                    </HStack>
                    <HStack>
                      <FormLabel minW="88px">Per Volume</FormLabel>
                      <FormControl>
                        <Field as={Input} name="liquid_formation.per_volume.value" type="text" />
                      </FormControl>
                      <FormControl>
                        <SelectField
                          name="liquid_formation.per_volume.unit"
                          options={[
                            {
                              value: 'mL',
                              label: 'mL'
                            },
                            {
                              value: 'L',
                              label: 'L'
                            }
                          ]}
                        />
                      </FormControl>
                    </HStack>
                    <Text fontSize={16} fontWeight="medium" pt={4} pb={2}>
                      Result
                    </Text>
                    <HStack pb={2}>
                      <FormLabel minW="88px">Dose</FormLabel>
                      <FormControl>
                        <Field as={Input} type="text" value={dose} readOnly disabled />
                      </FormControl>
                      <Button
                        px={6}
                        colorScheme="brand"
                        onClick={() => {
                          if (dose) {
                            const inputValSetter = Object.getOwnPropertyDescriptor(
                              window.HTMLInputElement.prototype!,
                              'value'
                            )!.set;
                            inputValSetter!.call(
                              quantityRef.current.children[0],
                              dose.split(' ')[0]
                            );
                            const ev = new Event('input', { bubbles: true });
                            quantityRef.current.children[0].dispatchEvent(ev);
                            onClose();
                          }
                        }}
                      >
                        Use ›
                      </Button>
                    </HStack>
                    <HStack>
                      <FormLabel minW="88px">Liquid Dose</FormLabel>
                      <FormControl>
                        <Field as={Input} type="text" value={liquidDose} readOnly disabled />
                      </FormControl>
                      <Button
                        px={6}
                        fontSize="md"
                        colorScheme="brand"
                        onClick={() => {
                          if (liquidDose) {
                            const inputValSetter = Object.getOwnPropertyDescriptor(
                              window.HTMLInputElement.prototype!,
                              'value'
                            )!.set;
                            inputValSetter!.call(
                              quantityRef.current.children[0],
                              liquidDose.split(' ')[1].includes('mL')
                                ? liquidDose.split(' ')[0]
                                : parseFloat(liquidDose.split(' ')[0]) * 1000
                            );
                            const ev = new Event('input', { bubbles: true });
                            quantityRef.current.children[0].dispatchEvent(ev);
                            unitRef.current.setValue({
                              value: 'Milliliter',
                              label: 'Milliliter'
                            });
                            onClose();
                          }
                        }}
                      >
                        Use ›
                      </Button>
                    </HStack>
                  </Box>
                </Flex>
              );
            }}
          </Formik>
        </ModalBody>
        <ModalFooter px="0" />
      </ModalContent>
    </Modal>
  );
};
