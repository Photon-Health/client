import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Switch,
  VStack,
  Text,
  Grid,
  Textarea,
  FormHelperText
} from '@chakra-ui/react';
import { ErrorMessage, Field, FieldProps, FormikErrors } from 'formik';

import { OrganizationSettingsFormValues } from './utils';
import { FileUploader } from '../../../../components/FileUpload';
import { useClinicalRest } from 'apps/app/src/hooks/useClinicalRest';

const InputField = ({ field }: FieldProps) => <Input {...field} />;

const TextAreaField = ({ field }: FieldProps) => <Textarea {...field} />;

const ColorField = ({ field }: FieldProps) => (
  <Input {...field} type="color" maxW={12} paddingX={0} />
);

const SwitchField = ({ field }: FieldProps) => (
  <Switch {...field} id={field.name} isChecked={field.value} />
);

export function OrganizationSettingsForm({
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
  const restApi = useClinicalRest();

  return (
    <form>
      <VStack spacing={6} alignItems="flex-start">
        <Text fontSize="sm">
          These organization settings affect both the provider and patient experiences.
          Provider-related updates apply only to the web application flow. If your organization uses
          an embedded experience, please refer to our documentation to learn how to modify the
          prescriber experience accordingly.
        </Text>

        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Branding
          </Text>
          <Flex gap={7} w="100%" maxW={{ base: '100%', md: '50%' }} flexDirection="column">
            <FormControl isInvalid={!!errors.brandColor}>
              <FormLabel htmlFor="brandColor">Brand Color</FormLabel>
              <FormHelperText mb={2}>
                If set, this hex code will be the primary color for CTA buttons in the
                patient-facing experience.
              </FormHelperText>
              <Flex gap={2}>
                <Field component={InputField} name="brandColor" id="brandColor" />
                <Field component={ColorField} name="brandColor" />
              </Flex>
              <ErrorMessage name="brandColor" component={FormErrorMessage} />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="brandLogo">Brand Logo</FormLabel>
              <FormHelperText mb={2}>
                If set, this logo will be displayed in the navigation bar in the patient-facing
                experience. Use a small, fully-cropped image. Recommended maximum size: 150×40px
                (PNG with transparent background).
              </FormHelperText>
              <Field
                as={FileUploader}
                name="brandLogo"
                id="brandLogo"
                onChange={(val: string) => {
                  setFieldValue('brandLogo', val);
                }}
                upload={async (file: File) => {
                  const formData = new FormData();
                  formData.append('file', file);

                  const data = await restApi.post<{ url: string }, FormData>(
                    '/uploads/logo',
                    formData
                  );
                  return data.url;
                }}
              />
            </FormControl>
          </Flex>
        </VStack>
        {/* Commenting out this section temporarily until we add ability in backend to send emails to their chosen destinations */}
        {/*
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
        */}
        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Provider Experience
          </Text>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={7} w="100%">
            <FormControl isInvalid={!!errors.providerUx?.enablePrescriberOrdering}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enablePrescriberOrdering" />
                <FormLabel htmlFor="providerUx.enablePrescriberOrdering" mb={0}>
                  Enable Ordering
                </FormLabel>
              </Flex>
              <FormHelperText>
                Allow prescribers to create prescription orders to pharmacies.
              </FormHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableWebAppPrescribe}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enableWebAppPrescribe" />
                <FormLabel htmlFor="providerUx.enableWebAppPrescribe" mb={0}>
                  Enable Prescribing on Web App
                </FormLabel>
              </Flex>
              <FormHelperText>
                Allow prescribers to create prescriptions on the Photon Web App.
              </FormHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enablePrescribeToOrder}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enablePrescribeToOrder" />
                <FormLabel htmlFor="providerUx.enablePrescribeToOrder" mb={0}>
                  Enable Prescribe to Order
                </FormLabel>
              </Flex>
              <FormHelperText>
                Allow prescribers to write prescriptions and submit them within an order from a
                single view.
              </FormHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableRxTemplates}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enableRxTemplates" />
                <FormLabel htmlFor="providerUx.enableRxTemplates" mb={0}>
                  Enable Prescription Templates
                </FormLabel>
              </Flex>
              <FormHelperText>
                Allow prescribers to check a box to save commonly prescribed medications to personal
                templates in workflow.
              </FormHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableDuplicateRxWarnings}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enableDuplicateRxWarnings" />
                <FormLabel htmlFor="providerUx.enableDuplicateRxWarnings" mb={0}>
                  Enable Duplicate Prescription Warnings
                </FormLabel>
              </Flex>
              <FormHelperText>
                Warn prescribers when a new prescription matches a recent one for the same patient.
              </FormHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableTreatmentHistory}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enableTreatmentHistory" />
                <FormLabel htmlFor="providerUx.enableTreatmentHistory" mb={0}>
                  Enable Treatment History
                </FormLabel>
              </Flex>
              <FormHelperText>
                Show a patient's medication history while prescribing. This will include any
                medications written on Photon in addition to any external med history synced on the
                patients profile.
              </FormHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enablePatientRouting}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enablePatientRouting" />
                <FormLabel htmlFor="providerUx.enablePatientRouting" mb={0}>
                  Enable Patient Routing
                </FormLabel>
              </Flex>
              <FormHelperText>
                Give prescribers the option to select “Send to Patient” when choosing a pharmacy to
                defer pharmacy selection to the patient.
              </FormHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enablePickupPharmacies}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enablePickupPharmacies" />
                <FormLabel htmlFor="providerUx.enablePickupPharmacies" mb={0}>
                  Enable Pickup Pharmacies
                </FormLabel>
              </Flex>
              <FormHelperText>
                Give prescribers the option to search for local pickup pharmacies.
              </FormHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.providerUx?.enableDeliveryPharmacies}>
              <Flex gap={2}>
                <Field component={SwitchField} name="providerUx.enableDeliveryPharmacies" />
                <FormLabel htmlFor="providerUx.enableDeliveryPharmacies" mb={0}>
                  Enable Delivery Pharmacies
                </FormLabel>
              </Flex>
              <FormHelperText>
                Give prescribers the option to select from Partner mail order pharmacies. Please
                reach out to customer@photon.health if you would like to add a pharmacy to this
                list.
              </FormHelperText>
            </FormControl>
          </Grid>
        </VStack>
        <VStack spacing={3} alignItems="flex-start" w="100%">
          <Text fontSize="lg" fontWeight="medium">
            Patient Experience
          </Text>
          <Flex gap={7} w={{ base: '100%', md: '50%' }}>
            <FormControl isInvalid={!!errors.priorAuthorizationExceptionMessage}>
              <FormLabel htmlFor="priorAuthorizationExceptionMessage">
                Prior Authorization Exception Message
              </FormLabel>
              <FormHelperText mb={2}>
                This message is displayed to patients when a pharmacy notifies Photon a prior
                authorization is required to inform them of next steps.
              </FormHelperText>
              <Field
                component={TextAreaField}
                rows={4}
                name="priorAuthorizationExceptionMessage"
                id="priorAuthorizationExceptionMessage"
                placeholder="Your insurance needs information from your provider to cover this medication. Contact your provider for alternatives or pay the cash price."
              />
            </FormControl>
          </Flex>
          {/*
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
          */}
        </VStack>
      </VStack>
    </form>
  );
}
