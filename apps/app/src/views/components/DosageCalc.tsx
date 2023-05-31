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
import { SelectField } from './SelectField';

const initialValues = {
  input: {
    dosage: {
      value: 0,
      unit: 'mg/kg'
    },
    weight: {
      value: 0,
      unit: 'lb'
    }
  },
  liquid_formation: {
    drug_amount: {
      value: 0,
      unit: 'mg'
    },
    per_volume: {
      value: 0,
      unit: 'mL'
    }
  }
};

const compatibleDosageWeight = (dosageUnit: string, weightUnit: string) => {
  if ((weightUnit === 'kg' || weightUnit === 'g') && dosageUnit.includes('kg')) {
    return true;
  }
  if ((weightUnit === 'lb' || weightUnit === 'oz') && dosageUnit.includes('lb')) {
    return true;
  }
  return false;
};

const convertCompatibleWeight = (dosageUnit: string, weight: { value: number; unit: string }) => {
  if (dosageUnit.includes('kg') && weight.unit === 'oz') {
    return (weight.value / 16) * 0.453592;
  }
  if (dosageUnit.includes('kg') && weight.unit === 'lb') {
    return weight.value * 0.453592;
  }
  if (dosageUnit.includes('lb') && weight.unit === 'kg') {
    return weight.value * 2.20462;
  }
  if (dosageUnit.includes('lb') && weight.unit === 'g') {
    return (weight.value / 1000) * 2.20462;
  }
  return 0;
};

const compatibleLiquid = (dosageUnit: string, liquidDosageUnit: string) => {
  if (liquidDosageUnit === 'mcg' && dosageUnit.split('/')[0] === 'mcg') {
    return true;
  }
  if (liquidDosageUnit === 'mg' && dosageUnit.split('/')[0] === 'mg') {
    return true;
  }
  if (liquidDosageUnit === 'g' && dosageUnit.split('/')[0] === 'g') {
    return true;
  }
  return false;
};

const convertCompatibleLiquid = (dosageUnit: string, liquid: { value: number; unit: string }) => {
  if (dosageUnit.includes('mcg') && liquid.unit === 'mcg') {
    return liquid.value / (1000 * 1000);
  }
  if (dosageUnit.includes('mcg') && liquid.unit === 'g') {
    return liquid.value * (1000 * 1000);
  }
  if (dosageUnit.includes('mg') && liquid.unit === 'mcg') {
    return liquid.value / 1000;
  }
  if (dosageUnit.includes('mg') && liquid.unit === 'g') {
    return liquid.value * 1000;
  }
  if (dosageUnit.includes('g') && liquid.unit === 'mcg') {
    return liquid.value / (1000 * 1000);
  }
  if (dosageUnit.includes('g') && liquid.unit === 'mg') {
    return liquid.value / 1000;
  }

  return 0;
};

const calculateDosage = (
  dosage: {
    value: number;
    unit: string;
  },
  weight: { value: number; unit: string }
) => {
  if (compatibleDosageWeight(dosage.unit, weight.unit) && weight.unit === 'g') {
    return dosage.value * (weight.value / 1000);
  }
  if (compatibleDosageWeight(dosage.unit, weight.unit) && weight.unit === 'oz') {
    return dosage.value * (weight.value / 16);
  }
  if (compatibleDosageWeight(dosage.unit, weight.unit)) {
    return dosage.value * weight.value;
  }
  return dosage.value * convertCompatibleWeight(dosage.unit, weight);
};

const calculateLiquidDosage = (
  dosage: number,
  dosage_unit: string,
  drug: number,
  drug_unit: string,
  volume: number
) => {
  if (
    drug === 0 ||
    drug.toString().length === 0 ||
    parseInt(drug.toString(), 10) === 0 ||
    window.isNaN(drug)
  ) {
    return 0;
  }
  if (compatibleLiquid(dosage_unit, drug_unit)) {
    return (dosage * volume) / drug;
  }
  return (dosage * volume) / convertCompatibleLiquid(dosage_unit, { value: drug, unit: drug_unit });
};

export const DosageCalc = ({
  isOpen,
  onClose,
  quantityRef,
  drugRef,
  unitRef
}: {
  isOpen: boolean;
  onClose: any;
  quantityRef: MutableRefObject<any>;
  drugRef: MutableRefObject<any>;
  unitRef: MutableRefObject<any>;
}) => {
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
  }, [isOpen]);

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
          <Formik
            initialValues={initialValues}
            onSubmit={() => {}}
            validate={(values) => {
              let dosage = calculateDosage(values.input.dosage, values.input.weight);
              if (
                dosage.toString().split('.').length > 1 &&
                dosage.toString().split('.')[1].length > 4
              ) {
                dosage = parseFloat(dosage.toFixed(4));
              }
              let liquidDosage = calculateLiquidDosage(
                dosage,
                values.input.dosage.unit.split('/')[0],
                values.liquid_formation.drug_amount.value,
                values.liquid_formation.drug_amount.unit,
                values.liquid_formation.per_volume.value
              );
              if (
                liquidDosage.toString().split('.').length > 1 &&
                liquidDosage.toString().split('.')[1].length > 4
              ) {
                liquidDosage = parseFloat(liquidDosage.toFixed(4));
              }
              setDose(`${dosage} ${values.input.dosage.unit.split('/')[0]}`);
              setLiquidDose(`${liquidDosage} ${values.liquid_formation.per_volume.unit}`);
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
                          options={[
                            {
                              value: 'mcg/kg',
                              label: 'mcg/kg'
                            },
                            {
                              value: 'mg/kg',
                              label: 'mg/kg'
                            },
                            {
                              value: 'g/kg',
                              label: 'g/kg'
                            }
                          ]}
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
