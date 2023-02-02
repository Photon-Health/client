import {
  FormControl,
  FormLabel,
  HStack,
  Text,
  Checkbox,
  VStack,
  FormErrorMessage,
  ModalFooter,
  Textarea,
  Heading,
  useToast
} from '@chakra-ui/react'

import { RefObject, useEffect, useState } from 'react'
import { Field, Formik } from 'formik'

import { OptionalText } from '../../../../components/OptionalText'
import { DispenseUnitSelect } from '../../../../components/DispenseUnitSelect'
import { CtaButtons } from './components/CtaButtons'
import { Treatment } from './components/Treatment'
import { DaysSupply } from './components/DaysSupply'
import { RefillsInput } from './components/RefillsInput'
import { DispenseQuantity } from './components/DispenseQuantity'

import { TEMPLATE_INITIAL_VALUES, TEMPLATE_SCHEMA } from './utils'

interface TemplateFormProps {
  edit?: boolean
  loading: boolean
  catalogs: any
  createRxTemplateMutation: Function
  updatePrescriptionTemplateMutation: Function
  medicationSelectRef: RefObject<any>
  quantityRef: RefObject<any>
  unitRef: RefObject<any>
  setDoseCalcVis: Function
  isModal?: boolean
  onClose: () => void
  templateToEdit: any
  setTemplateToEdit: any
}

export const TemplateForm = ({
  edit,
  catalogs,
  createRxTemplateMutation,
  updatePrescriptionTemplateMutation,
  medicationSelectRef,
  quantityRef,
  unitRef,
  setDoseCalcVis,
  loading,
  isModal,
  onClose,
  templateToEdit,
  setTemplateToEdit
}: TemplateFormProps) => {
  const toast = useToast()

  const [initialValues, setInitialValues] = useState(TEMPLATE_INITIAL_VALUES)

  useEffect(() => {
    if (templateToEdit?.id) {
      const vals = {
        ...templateToEdit,
        refillsInput: templateToEdit.fillsAllowed > 0 ? templateToEdit.fillsAllowed - 1 : 0
      }
      setInitialValues(vals)
    }
  }, [templateToEdit?.id])

  const handleCancel = (resetForm: any) => {
    if (isModal) onClose()

    resetForm()
    setInitialValues(TEMPLATE_INITIAL_VALUES) // added to get daysSuppply resetting
    setTemplateToEdit(undefined)
  }

  const onSubmit = async (values: any, { validateForm, setSubmitting, resetForm }: any) => {
    validateForm(values)

    const variables = values
    variables.treatmentId = values.treatment.id
    if (values.treatment.__typename === 'MedicalEquipment') {
      variables.daysSupply = undefined
      variables.dispenseAsWritten = false
      variables.dispenseUnit = 'Each'
      variables.fillsAllowed = 1
    }

    setSubmitting(true)

    const templateVariables: any = {
      catalogId: catalogs.catalogs?.[0]?.id,
      daysSupply: values.daysSupply ? parseInt(values.daysSupply, 10) : 0,
      dispenseAsWritten: values.dispenseAsWritten,
      dispenseQuantity: values.dispenseQuantity ? parseFloat(values.dispenseQuantity) : 0,
      dispenseUnit: values.dispenseUnit,
      instructions: values.instructions,
      notes: values.notes,
      // We add +1 to whatever they input in the Refill field on the form when creating the template
      fillsAllowed: values.refillsInput ? parseInt(values.refillsInput, 10) + 1 : 1,
      // refillsInput gets submitted but graphQL doesn't use this for anything
      refillsInput: values.refillsInput ? parseInt(values.refillsInput, 10) : 0
    }

    if (edit) {
      templateVariables.templateId = templateToEdit.id
      updatePrescriptionTemplateMutation({
        variables: templateVariables,
        onCompleted: () => {
          setSubmitting(false)

          if (isModal) onClose()

          resetForm()
          setInitialValues(TEMPLATE_INITIAL_VALUES)
          setTemplateToEdit(undefined)

          toast({
            title: 'Template edited',
            status: 'success'
          })
        }
      })
    } else {
      templateVariables.treatmentId = values.treatmentId
      createRxTemplateMutation({
        variables: templateVariables,
        onCompleted: () => {
          setSubmitting(false)

          if (isModal) onClose()

          resetForm()
          setInitialValues(TEMPLATE_INITIAL_VALUES)
          setTemplateToEdit(undefined)

          toast({
            title: 'Template added',
            status: 'success'
          })
        }
      })
    }

    setTimeout(() => setSubmitting(false), 5000)
  }

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
        setSubmitting,
        isSubmitting,
        resetForm
      }) => {
        const hidden = values.treatment.__typename === 'MedicalEquipment'

        return (
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
                catalogs={catalogs}
              />

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

              {isModal ? (
                <ModalFooter px="0">
                  <CtaButtons
                    edit={edit}
                    handleCancel={() => handleCancel(resetForm)}
                    loading={loading}
                    isSubmitting={isSubmitting}
                    setSubmitting={setSubmitting}
                    catalogs={catalogs}
                  />
                </ModalFooter>
              ) : (
                <CtaButtons
                  edit={edit}
                  handleCancel={() => handleCancel(resetForm)}
                  loading={loading}
                  isSubmitting={isSubmitting}
                  setSubmitting={setSubmitting}
                  catalogs={catalogs}
                />
              )}
            </VStack>
          </form>
        )
      }}
    </Formik>
  )
}

TemplateForm.defaultProps = {
  edit: false,
  isModal: false
}
