import {
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';

import { Field, Formik, FormikConfig } from 'formik';
import { ChangeEvent, RefObject, useCallback, useEffect, useState } from 'react';

import { DispenseUnitSelect } from '../../../../../components/DispenseUnitSelect';
import { OptionalText } from '../../../../../components/OptionalText';
import { CtaButtons } from './components/CtaButtons';
import { DaysSupply } from './components/DaysSupply';
import { DispenseQuantity } from './components/DispenseQuantity';
import { RefillsInput } from './components/RefillsInput';
import { Treatment } from './components/Treatment';

import { types, usePhoton } from '@photonhealth/react';
import { CatalogTreatmentFieldsMap } from 'apps/app/src/model/fragments';
import { TEMPLATE_INITIAL_VALUES, TEMPLATE_SCHEMA, TemplateSchemaType } from './utils';
import { StyledToast } from 'apps/app/src/views/components/StyledToast';

type PrescriptionTemplate = types.PrescriptionTemplate;

interface CreateRxTemplateVariables {
  catalogId: string;
  treatmentId: string;
  dispenseAsWritten: boolean | undefined;
  dispenseQuantity: number | undefined;
  dispenseUnit: string | undefined;
  fillsAllowed: number | undefined;
  daysSupply: number | undefined;
  instructions: string | undefined;
  notes: string | undefined;
  name: string | undefined;
  isPrivate: boolean | undefined;
}
interface UpdateRxTemplateVariables {
  templateId: string;
  catalogId: string;
  treatmentId: string;
  dispenseAsWritten: boolean | undefined;
  dispenseQuantity: number | undefined;
  dispenseUnit: string | undefined;
  fillsAllowed: number | undefined;
  daysSupply: number | undefined;
  instructions: string | undefined;
  notes: string | undefined;
  name: string | undefined;
}

interface TemplateFormProps {
  isOpen: boolean;
  edit?: boolean;
  loading: boolean;
  catalogId: string;
  medicationSelectRef: RefObject<any>;
  quantityRef: RefObject<any>;
  unitRef: RefObject<any>;
  setDoseCalcVis: (b: boolean) => void;
  onClose?: () => void;
  templateToEdit: PrescriptionTemplate | undefined;
  clearSelectedTemplate: () => void;
}

const templateFormValue = (templateToEdit: PrescriptionTemplate | undefined): TemplateSchemaType =>
  templateToEdit
    ? {
        name: templateToEdit.name ?? '',
        dispenseAsWritten: templateToEdit.dispenseAsWritten ?? false,
        dispenseQuantity: templateToEdit.dispenseQuantity ?? 1,
        dispenseUnit: templateToEdit.dispenseUnit ?? 'Each',
        fillsAllowed: templateToEdit.fillsAllowed ?? 1,
        daysSupply: templateToEdit.daysSupply ?? 30,
        instructions: templateToEdit.instructions ?? '',
        notes: templateToEdit.notes ?? '',
        treatment: { __typename: '', ...templateToEdit.treatment },
        refillsInput:
          (templateToEdit.fillsAllowed ?? 0) > 0 ? (templateToEdit.fillsAllowed ?? 1) - 1 : 0,
        isPublic: !templateToEdit.isPrivate
      }
    : TEMPLATE_INITIAL_VALUES;

export const TemplateForm = ({
  isOpen,
  edit,
  catalogId,
  medicationSelectRef,
  quantityRef,
  unitRef,
  setDoseCalcVis,
  loading,
  onClose = () => {},
  templateToEdit,
  clearSelectedTemplate
}: TemplateFormProps) => {
  const { createPrescriptionTemplate, updatePrescriptionTemplate } = usePhoton();
  const toast = useToast();

  const [createRxTemplateMutation, { loading: loadingCreate }] = createPrescriptionTemplate({
    refetchQueries: ['getCatalog'],
    awaitRefetchQueries: true,
    refetchArgs: {
      id: catalogId,
      fragment: CatalogTreatmentFieldsMap
    }
  });

  const [updatePrescriptionTemplateMutation, { loading: loadingUpdate }] =
    updatePrescriptionTemplate({
      refetchQueries: ['getCatalog'],
      awaitRefetchQueries: true,
      refetchArgs: {
        id: catalogId,
        fragment: CatalogTreatmentFieldsMap
      }
    });

  const [initialValues, setInitialValues] = useState<TemplateSchemaType>(
    templateFormValue(templateToEdit)
  );

  useEffect(() => {
    if (templateToEdit?.id) {
      setInitialValues(templateFormValue(templateToEdit));
    }
  }, [templateToEdit?.id]);

  const handleClose = useCallback(() => {
    setInitialValues(TEMPLATE_INITIAL_VALUES); // added to get daysSuppply resetting
    clearSelectedTemplate();
    onClose();
  }, [clearSelectedTemplate, onClose]);

  const handleCancel = (resetForm: () => void) => {
    resetForm();
    setInitialValues(TEMPLATE_INITIAL_VALUES); // added to get daysSuppply resetting
    clearSelectedTemplate();
    onClose();
  };

  const onSubmit: FormikConfig<TemplateSchemaType>['onSubmit'] = async (
    values: TemplateSchemaType,
    { validateForm, setSubmitting, resetForm }
  ) => {
    setSubmitting(true);

    await validateForm(values);

    if (edit) {
      return await updatePrescriptionTemplateMutation({
        variables: {
          templateId: templateToEdit!.id,
          name: values.name || '',
          catalogId,
          daysSupply: values.daysSupply ? values.daysSupply : 0,
          dispenseAsWritten: values.dispenseAsWritten ?? false,
          dispenseQuantity: values.dispenseQuantity ? values.dispenseQuantity : 0,
          dispenseUnit: values.dispenseUnit,
          instructions: values.instructions,
          notes: values.notes,
          // We add +1 to whatever they input in the Refill field on the form when creating the template
          fillsAllowed: values.refillsInput ? values.refillsInput + 1 : 1,
          treatmentId: values.treatment.id,
          ...(values.treatment.__typename === 'MedicalEquipment'
            ? {
                daysSupply: undefined,
                dispenseAsWritten: false,
                dispenseUnit: 'Each',
                fillsAllowed: 1
              }
            : {})
        } satisfies UpdateRxTemplateVariables,
        onCompleted: () => {
          setSubmitting(false);
          resetForm();
          handleClose();
          toast({
            position: 'top-right',
            duration: 4000,
            render: ({ onClose }) => (
              <StyledToast onClose={onClose} type="success" description="Template edited" />
            )
          });
        }
      });
    } else {
      createRxTemplateMutation({
        variables: {
          name: values.name || '',
          catalogId,
          daysSupply: values.daysSupply ? values.daysSupply : 0,
          dispenseAsWritten: values.dispenseAsWritten ?? false,
          dispenseQuantity: values.dispenseQuantity ? values.dispenseQuantity : 0,
          dispenseUnit: values.dispenseUnit,
          instructions: values.instructions,
          notes: values.notes,
          // We add +1 to whatever they input in the Refill field on the form when creating the template
          fillsAllowed: values.refillsInput ? values.refillsInput + 1 : 1,
          treatmentId: values.treatment.id,
          isPrivate: !values.isPublic,
          ...(values.treatment.__typename === 'MedicalEquipment'
            ? {
                daysSupply: undefined,
                dispenseAsWritten: false,
                dispenseUnit: 'Each',
                fillsAllowed: 1
              }
            : {})
        } satisfies CreateRxTemplateVariables,
        onCompleted: () => {
          setSubmitting(false);
          resetForm();
          handleClose();
          toast({
            position: 'top-right',
            duration: 4000,
            render: ({ onClose }) => (
              <StyledToast onClose={onClose} type="success" description="Template added" />
            )
          });
        }
      });
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={TEMPLATE_SCHEMA}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit,
        errors,
        touched,
        values,
        setFieldValue,
        isSubmitting,
        setSubmitting,
        resetForm,
        isValid
      }) => {
        const hidden = values.treatment.__typename === 'MedicalEquipment';

        const onClose = () => {
          setSubmitting(false);
          handleClose();
        };
        return (
          <Modal isOpen={isOpen} onClose={onClose} size="lg" closeOnOverlayClick closeOnEsc>
            <ModalOverlay />
            <ModalContent>
              <ModalBody p={8}>
                <form onSubmit={handleSubmit} noValidate id="template-builder">
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={2} align="start">
                      <Heading as="h6" size="xxs">
                        {edit ? 'Editing Template' : 'Create New Template'}
                      </Heading>
                      {!edit ? (
                        <Text fontWeight="normal" fontSize="sm" color="gray.500">
                          Create a template for a medication in your catalog
                        </Text>
                      ) : null}
                    </VStack>
                    <Treatment
                      errors={errors}
                      touched={touched}
                      edit={edit}
                      values={values}
                      medicationSelectRef={medicationSelectRef}
                      catalogId={catalogId}
                    />

                    <FormControl>
                      <FormLabel>
                        Template Name
                        <OptionalText />
                      </FormLabel>

                      <Input
                        type="text"
                        maxLength={50}
                        value={values.name}
                        onChange={(val: ChangeEvent<HTMLInputElement>) =>
                          setFieldValue('name', val.target.value)
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <Field
                        as={Checkbox}
                        name="dispenseAsWritten"
                        isChecked={values.dispenseAsWritten}
                        hidden={hidden}
                      >
                        <HStack alignItems="baseline">
                          <Text>Dispense as written</Text>
                          <OptionalText />
                        </HStack>
                      </Field>
                    </FormControl>

                    <HStack align="flex-start" spacing={4}>
                      <VStack align="flex-start">
                        <DispenseQuantity
                          errors={errors}
                          touched={touched}
                          quantityRef={quantityRef}
                          setFieldValue={setFieldValue}
                          hidden={hidden}
                          setDoseCalcVis={setDoseCalcVis}
                        />
                      </VStack>

                      <FormControl
                        hidden={hidden}
                        isInvalid={!!errors.dispenseUnit && touched.dispenseUnit}
                      >
                        <FormLabel htmlFor="dispenseUnit">Dispense Unit</FormLabel>
                        <DispenseUnitSelect name="dispenseUnit" ref={unitRef} />
                        <FormErrorMessage>{errors.dispenseUnit}</FormErrorMessage>
                      </FormControl>
                    </HStack>

                    <HStack align="flex-start" spacing={4}>
                      <DaysSupply
                        errors={errors}
                        touched={touched}
                        hidden={hidden}
                        setFieldValue={setFieldValue}
                      />
                      <RefillsInput
                        errors={errors}
                        touched={touched}
                        hidden={hidden}
                        setFieldValue={setFieldValue}
                      />
                    </HStack>

                    <FormControl>
                      <FormLabel htmlFor="instructions">Patient Instructions (SIG)</FormLabel>
                      <Field as={Textarea} name="instructions" />
                      <FormErrorMessage>{errors.instructions}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="notes" optionalIndicator={<OptionalText />}>
                        Pharmacy Note
                      </FormLabel>
                      <Field as={Textarea} name="notes" />
                      <FormErrorMessage>{errors.notes}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <Field
                        as={Checkbox}
                        name="isPublic"
                        isChecked={values.isPublic}
                        isDisabled={edit}
                      >
                        <HStack alignItems="baseline">
                          <Text>Add to Organization Templates</Text>
                        </HStack>
                      </Field>
                    </FormControl>
                    <ModalFooter px="0">
                      <CtaButtons
                        isValid={isValid}
                        edit={edit}
                        handleCancel={() => handleCancel(resetForm)}
                        loading={loading || loadingCreate || loadingUpdate}
                        isSubmitting={isSubmitting}
                      />
                    </ModalFooter>
                  </VStack>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>
        );
      }}
    </Formik>
  );
};

TemplateForm.defaultProps = {
  edit: false,
  isModal: false
};
