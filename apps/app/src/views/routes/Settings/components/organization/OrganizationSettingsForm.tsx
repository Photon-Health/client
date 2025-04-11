import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Switch,
  VStack,
  Text,
  Grid
} from '@chakra-ui/react';
import { ErrorMessage, Field, FieldProps, FormikErrors } from 'formik';
import { ChangeEvent } from 'react';
import { OrganizationSettingsFormValues } from './utils';

const InputField = ({ field }: FieldProps) => <Input {...field} />;

const ColorField = ({ field }: FieldProps) => (
  <Input {...field} type="color" maxW={12} paddingX={0} />
);

const SwitchField = ({ field }: FieldProps) => <Switch {...field} isChecked={field.value} />;

export function OrganizationSettingsForm({
  values,
  errors,
  setFieldValue
}: {
  values: OrganizationSettingsFormValues;
  errors: FormikErrors<OrganizationSettingsFormValues>;
  setFieldValue: (
    field: keyof OrganizationSettingsFormValues,
    value: OrganizationSettingsFormValues[keyof OrganizationSettingsFormValues]
  ) => void;
}) {
  return (
    <form>
      <VStack spacing={6} alignItems="flex-start">
        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Branding
          </Text>
          <Flex gap={4} w="50%">
            <FormControl isInvalid={!!errors.brandColor}>
              <FormLabel htmlFor="brandColor">Brand Color</FormLabel>
              <Flex gap={2}>
                <Field component={InputField} name="brandColor" id="brandColor" />
                <Field component={ColorField} name="brandColor" />
              </Flex>
              <ErrorMessage name="brandColor" component={FormErrorMessage} />
            </FormControl>
          </Flex>
        </VStack>
        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Support
          </Text>
          <Flex gap={2} w="50%">
            <FormControl isInvalid={!!errors.supportContactAdmin}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="supportContactAdmin"
                  id="supportContactAdmin"
                />
                <FormLabel htmlFor="supportContactAdmin">Contact Admin for Support</FormLabel>
              </Flex>
              <ErrorMessage name="supportContactAdmin" component={FormErrorMessage} />
            </FormControl>
          </Flex>
          {!values.supportContactAdmin && (
            <Flex gap={4} w="100%">
              <FormControl isInvalid={!!errors.supportName}>
                <FormLabel htmlFor="supportName">Support Contact Name</FormLabel>
                <Field component={InputField} name="supportName" id="supportName" />
                <ErrorMessage name="supportName" component={FormErrorMessage} />
              </FormControl>
              <FormControl isInvalid={!!errors.supportEmail}>
                <FormLabel htmlFor="supportEmail">Support Contact Email</FormLabel>
                <Field component={InputField} name="supportEmail" id="supportEmail" />
                <ErrorMessage name="supportEmail" component={FormErrorMessage} />
              </FormControl>
            </Flex>
          )}
        </VStack>
        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Rx Clarifications
          </Text>
          <Flex gap={4} w="100%">
            <FormControl isInvalid={!!errors.enableRxClarificationSupport}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="enableRxClarificationSupport"
                  id="enableRxClarificationSupport"
                />
                <FormLabel htmlFor="enableRxClarificationSupport">
                  Enable Rx Clarification Support
                </FormLabel>
              </Flex>
            </FormControl>
          </Flex>
          {values.enableRxClarificationSupport && (
            <Flex gap={4} w="100%">
              <FormControl isInvalid={!!errors.rxClarificationContactAdmin}>
                <Flex gap={2}>
                  <Field
                    as={Switch}
                    name="rxClarificationContactAdmin"
                    id="rxClarificationContactAdmin"
                    isChecked={values.rxClarificationContactAdmin}
                    value={values.rxClarificationContactAdmin}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('rxClarificationContactAdmin', e.target.checked);
                      if (e.target.checked && values.rxClarificationContactProvider) {
                        setFieldValue('rxClarificationContactProvider', false);
                      }
                    }}
                  />
                  <FormLabel htmlFor="rxClarificationContactAdmin">
                    Contact Admin for Rx Clarifications
                  </FormLabel>
                </Flex>
              </FormControl>
              <FormControl isInvalid={!!errors.rxClarificationContactProvider}>
                <Flex gap={2}>
                  <Field
                    as={Switch}
                    name="rxClarificationContactProvider"
                    id="rxClarificationContactProvider"
                    isChecked={values.rxClarificationContactProvider}
                    value={values.rxClarificationContactProvider}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('rxClarificationContactProvider', e.target.checked);
                      if (e.target.checked && values.rxClarificationContactAdmin) {
                        setFieldValue('rxClarificationContactAdmin', false);
                      }
                    }}
                  />
                  <FormLabel htmlFor="rxClarificationContactProvider">
                    Contact Provider for Rx Clarifications
                  </FormLabel>
                </Flex>
              </FormControl>
            </Flex>
          )}
          {values.enableRxClarificationSupport &&
            !(values.rxClarificationContactAdmin || values.rxClarificationContactProvider) && (
              <Flex gap={4} w="100%">
                <FormControl isInvalid={!!errors.rxClarificationName}>
                  <FormLabel htmlFor="rxClarificationName">Rx Clarification Contact Name</FormLabel>
                  <Field
                    component={InputField}
                    name="rxClarificationName"
                    id="rxClarificationName"
                  />
                  <ErrorMessage name="rxClarificationName" component={FormErrorMessage} />
                </FormControl>
                <FormControl isInvalid={!!errors.rxClarificationEmail}>
                  <FormLabel htmlFor="rxClarificationEmail">
                    Rx Clarification Contact Email
                  </FormLabel>
                  <Field
                    component={InputField}
                    name="rxClarificationEmail"
                    id="rxClarificationEmail"
                  />
                  <ErrorMessage name="rxClarificationEmail" component={FormErrorMessage} />
                </FormControl>
              </Flex>
            )}
        </VStack>
        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Prior Authorization
          </Text>
          <Flex gap={4} w="100%">
            <FormControl isInvalid={!!errors.enablePriorAuthorizationSupport}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="enablePriorAuthorizationSupport"
                  id="enablePriorAuthorizationSupport"
                />
                <FormLabel htmlFor="enablePriorAuthorizationSupport">
                  Enable Prior Authorization Support
                </FormLabel>
              </Flex>
            </FormControl>
          </Flex>
          {values.enablePriorAuthorizationSupport && (
            <>
              <Flex gap={4} w="100%">
                <FormControl isInvalid={!!errors.priorAuthorizationContactAdmin}>
                  <Flex gap={2}>
                    <Field
                      as={Switch}
                      name="priorAuthorizationContactAdmin"
                      id="priorAuthorizationContactAdmin"
                      isChecked={values.priorAuthorizationContactAdmin}
                      value={values.priorAuthorizationContactAdmin}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('priorAuthorizationContactAdmin', e.target.checked);
                        if (e.target.checked && values.priorAuthorizationContactProvider) {
                          setFieldValue('priorAuthorizationContactProvider', false);
                        }
                      }}
                    />
                    <FormLabel htmlFor="priorAuthorizationContactAdmin">
                      Contact Admin for Prior Authorization
                    </FormLabel>
                  </Flex>
                </FormControl>
                <FormControl isInvalid={!!errors.priorAuthorizationContactProvider}>
                  <Flex gap={2}>
                    <Field
                      as={Switch}
                      name="priorAuthorizationContactProvider"
                      id="priorAuthorizationContactProvider"
                      isChecked={values.priorAuthorizationContactProvider}
                      value={values.priorAuthorizationContactProvider}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('priorAuthorizationContactProvider', e.target.checked);
                        if (e.target.checked && values.priorAuthorizationContactAdmin) {
                          setFieldValue('priorAuthorizationContactAdmin', false);
                        }
                      }}
                    />
                    <FormLabel htmlFor="priorAuthorizationContactProvider">
                      Contact Provider for Prior Authorization
                    </FormLabel>
                  </Flex>
                </FormControl>
              </Flex>
            </>
          )}
          {values.enablePriorAuthorizationSupport &&
            !(
              values.priorAuthorizationContactAdmin || values.priorAuthorizationContactProvider
            ) && (
              <Flex gap={4} w="100%">
                <FormControl isInvalid={!!errors.priorAuthorizationName}>
                  <FormLabel htmlFor="priorAuthorizationName">
                    Prior Authorization Contact Name
                  </FormLabel>
                  <Field
                    component={InputField}
                    name="priorAuthorizationName"
                    id="priorAuthorizationName"
                  />
                  <ErrorMessage name="priorAuthorizationName" component={FormErrorMessage} />
                </FormControl>
                <FormControl isInvalid={!!errors.priorAuthorizationEmail}>
                  <FormLabel htmlFor="priorAuthorizationEmail">
                    Prior Authorization Contact Email
                  </FormLabel>
                  <Field
                    component={InputField}
                    name="priorAuthorizationEmail"
                    id="priorAuthorizationEmail"
                  />
                  <ErrorMessage name="priorAuthorizationEmail" component={FormErrorMessage} />
                </FormControl>
              </Flex>
            )}
        </VStack>
        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Provider Experience
          </Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
            <FormControl isInvalid={!!errors.providerUx?.enablePrescriberOrdering}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="providerUx.enablePrescriberOrdering"
                  id="providerUx.enablePrescriberOrdering"
                />
                <FormLabel htmlFor="providerUx.enablePrescriberOrdering">Enable Ordering</FormLabel>
              </Flex>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enablePrescribeToOrder}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="providerUx.enablePrescribeToOrder"
                  id="providerUx.enablePrescribeToOrder"
                />
                <FormLabel htmlFor="providerUx.enablePrescribeToOrder">
                  Enable Prescribe to Order
                </FormLabel>
              </Flex>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableRxTemplates}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="providerUx.enableRxTemplates"
                  id="providerUx.enableRxTemplates"
                />
                <FormLabel htmlFor="providerUx.enableRxTemplates">
                  Enable Prescription Templates
                </FormLabel>
              </Flex>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableDuplicateRxWarnings}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="providerUx.enableDuplicateRxWarnings"
                  id="providerUx.enableDuplicateRxWarnings"
                />
                <FormLabel htmlFor="providerUx.enableDuplicateRxWarnings">
                  Enable Duplicate Prescription Warnings
                </FormLabel>
              </Flex>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableTreatmentHistory}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="providerUx.enableTreatmentHistory"
                  id="providerUx.enableTreatmentHistory"
                />
                <FormLabel htmlFor="providerUx.enableTreatmentHistory">
                  Enable Treatment History
                </FormLabel>
              </Flex>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enablePatientRouting}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="providerUx.enablePatientRouting"
                  id="providerUx.enablePatientRouting"
                />
                <FormLabel htmlFor="providerUx.enablePatientRouting">
                  Enable Patient Routing
                </FormLabel>
              </Flex>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enablePickupPharmacies}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="providerUx.enablePickupPharmacies"
                  id="providerUx.enablePickupPharmacies"
                />
                <FormLabel htmlFor="providerUx.enablePickupPharmacies">
                  Enable Pickup Pharmacies
                </FormLabel>
              </Flex>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableDeliveryPharmacies}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="providerUx.enableDeliveryPharmacies"
                  id="providerUx.enableDeliveryPharmacies"
                />
                <FormLabel htmlFor="providerUx.enableDeliveryPharmacies">
                  Enable Delivery Pharmacies
                </FormLabel>
              </Flex>
            </FormControl>
          </Grid>
        </VStack>
        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Patient Experience
          </Text>
          <Flex gap={4} w="100%">
            <FormControl isInvalid={!!errors.patientUx?.enablePatientRerouting}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="patientUx.enablePatientRerouting"
                  id="patientUx.enablePatientRerouting"
                />
                <FormLabel htmlFor="patientUx.enablePatientRerouting">
                  Enable Patient Rerouting
                </FormLabel>
              </Flex>
            </FormControl>
          </Flex>
          <Flex gap={4} w="100%">
            <FormControl isInvalid={!!errors.patientUx?.enablePatientDeliveryPharmacies}>
              <Flex gap={2}>
                <Field
                  component={SwitchField}
                  name="patientUx.enablePatientDeliveryPharmacies"
                  id="patientUx.enablePatientDeliveryPharmacies"
                />
                <FormLabel htmlFor="patientUx.enablePatientDeliveryPharmacies">
                  Enable Patient Delivery Pharmacies
                </FormLabel>
              </Flex>
            </FormControl>
          </Flex>
          <Flex gap={4} w="50%">
            <FormControl isInvalid={!!errors.patientUx?.patientFeaturedPharmacyName}>
              <FormLabel htmlFor="patientUx.patientFeaturedPharmacyName">
                Patient Featured Pharmacy Name
              </FormLabel>
              <Field
                component={InputField}
                name="patientUx.patientFeaturedPharmacyName"
                id="patientUx.patientFeaturedPharmacyName"
              />
            </FormControl>
          </Flex>
        </VStack>
      </VStack>
    </form>
  );
}
