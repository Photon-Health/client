import * as yup from 'yup'
import { Formik, Field } from 'formik'

import {
  Alert,
  AlertIcon,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  VStack
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'

import React from 'react'
import { usePhoton } from '@photonhealth/react'
import { capitalizeFirst } from '../../utils'

const hookSchema = yup.object({
  url: yup
    .string()
    .required('Please enter a URL to receive webhooks')
    .matches(
      /(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~]*)*(#[\w-]*)?(\?.*)?/,
      'Please enter a valid URL'
    ),
  sharedSecret: yup.string().matches(/^\S*$/, 'Secrets cannot contain any whitespace'),
  radioGroup: yup.string().required('Please select one of the options'),
  filters: yup.array()
})

interface HookFormValues {
  url: string
  sharedSecret: string
  radioGroup: string
  filters: string[]
}

export const HookForm = () => {
  const [eventValue, setEventValue] = React.useState('')

  const { createWebhook } = usePhoton()
  const [createWebhookConfig, { loading, error }] = createWebhook({
    refetchQueries: ['getWebhooks'],
    awaitRefetchQueries: true
  })

  const navigate = useNavigate()
  const onClose = () => {
    navigate('/settings')
  }

  const initialValues: HookFormValues = {
    url: '',
    sharedSecret: '',
    radioGroup: '',
    filters: []
  }

  const allFilters = [
    'photon:order:created',
    'photon:order:placed',
    'photon:order:fulfillment',
    'photon:order:completed',
    'photon:order:error',
    'photon:prescription:created',
    'photon:prescription:depleted',
    'photon:prescription:expired',
    'photon:prescription:active'
  ]

  return (
    <>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.message}
        </Alert>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={hookSchema}
        onSubmit={async (values, { validateForm }) => {
          validateForm(values)
          if (eventValue === 'all') {
            // eslint-disable-next-line no-param-reassign
            values.filters = allFilters
          }
          createWebhookConfig({ variables: values, onCompleted: onClose })
        }}
      >
        {({ setFieldValue, handleSubmit, errors, touched }) => {
          return (
            <form onSubmit={handleSubmit} noValidate>
              <VStack spacing={2} align="stretch" pb="2" pt="3" maxWidth={{ lg: 'xl' }}>
                <FormControl isInvalid={!!errors.url && touched.url} pb="4">
                  <FormLabel htmlFor="url">Payload URL</FormLabel>
                  <Field as={Input} name="url" placeholder="https://example.com/postreceive" />
                  <FormErrorMessage>{errors.url}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.sharedSecret && touched.sharedSecret} pb="4">
                  <FormLabel htmlFor="sharedSecret">Secret</FormLabel>
                  <Field as={Input} name="sharedSecret" />
                  <FormHelperText>
                    You will not be able to view this secret again after the webhook is created.
                  </FormHelperText>
                  <FormErrorMessage>{errors.sharedSecret}</FormErrorMessage>
                </FormControl>
                <FormControl pb="4" isInvalid={!!errors.radioGroup && touched.radioGroup}>
                  <Field as={RadioGroup} onChange={setEventValue} value={eventValue}>
                    <Stack direction="column">
                      <Field as={Radio} name="radioGroup" value="all">
                        Send me all events
                      </Field>
                      <Field as={Radio} name="radioGroup" value="some">
                        Let me select individual events
                      </Field>
                    </Stack>
                  </Field>
                  <FormErrorMessage>{errors.radioGroup}</FormErrorMessage>
                </FormControl>
                {eventValue === 'some' && (
                  <FormControl isInvalid={!!errors.filters && touched.filters} pb="4">
                    <Field
                      as={CheckboxGroup}
                      name="filters"
                      onChange={() => {
                        setFieldValue('filters', [])
                      }}
                    >
                      <HStack alignItems="start" spacing={20}>
                        <SimpleGrid columns={[2]} spacing={3}>
                          {allFilters.map((filter) => (
                            <Field as={Checkbox} name="filters" value={filter}>
                              {capitalizeFirst(filter.split(':').slice(1).join(' '))}
                            </Field>
                          ))}
                        </SimpleGrid>
                      </HStack>
                    </Field>
                  </FormControl>
                )}
              </VStack>
              <Button type="submit" colorScheme="brand" disabled={loading}>
                Save
              </Button>
            </form>
          )
        }}
      </Formik>
    </>
  )
}
