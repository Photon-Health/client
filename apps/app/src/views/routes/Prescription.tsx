import { useParams, Link as RouterLink } from 'react-router-dom'

import { usePhoton } from '@photonhealth/react'
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Divider,
  IconButton,
  Stack,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  Text,
  VStack,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useBreakpointValue
} from '@chakra-ui/react'
import { FiCopy } from 'react-icons/fi'
import { Page } from '../components/Page'

import { formatDate } from '../../utils'

import { PRESCRIPTION_COLOR_MAP, PRESCRIPTION_STATE_MAP } from './Prescriptions'

import PatientView from '../components/PatientView'
import NameView from '../components/NameView'

export const Prescription = () => {
  const params = useParams()
  const id = params.prescriptionId

  const { getPrescription } = usePhoton()
  const { prescription, loading, error } = getPrescription({ id: id! })

  const rx = prescription || {}

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error.message}
      </Alert>
    )
  }

  const {
    prescriber,
    patient,
    dispenseAsWritten,
    dispenseQuantity,
    fillsAllowed,
    fillsRemaining,
    daysSupply,
    instructions
  } = rx

  const state = PRESCRIPTION_STATE_MAP[rx.state as keyof object] || ''
  const stateColor = PRESCRIPTION_COLOR_MAP[rx.state as keyof object] || ''

  const writtenAt = formatDate(rx.writtenAt)
  const effectiveDate = formatDate(rx.effectiveDate)
  const expirationDate = formatDate(rx.expirationDate)

  const isMobile = useBreakpointValue({ base: true, sm: false })
  const tableWidth = useBreakpointValue({ base: 'full', sm: '100%', md: '75%' })

  return (
    <Page kicker="Prescription" header={prescription?.treatment.name} loading={loading}>
      <VStack spacing={4} fontSize={{ base: 'md', md: 'lg' }} alignItems="start" w="100%" mt={0}>
        {loading ? (
          <Skeleton width="130px" height="35px" borderRadius="md" />
        ) : (
          <Button
            aria-label="New Order"
            as={RouterLink}
            to={`/orders/new?patientId=${patient.id}&prescriptionId=${id}`}
          >
            Create Order
          </Button>
        )}

        <Divider />

        <Stack direction="row" gap={3} w="full">
          <VStack align="start" borderRadius={6} w={isMobile ? '50%' : undefined}>
            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Patient
            </Text>
            {loading ? (
              <HStack alignContent="center" w="150px" display="flex">
                <SkeletonCircle size="10" />
                <SkeletonText noOfLines={1} flexGrow={1} />
              </HStack>
            ) : (
              <PatientView patient={patient} />
            )}
          </VStack>

          <Divider orientation="vertical" height="auto" />

          <VStack align="start" borderRadius={6} w={isMobile ? '50%' : undefined}>
            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Prescriber
            </Text>
            {loading ? (
              <HStack alignContent="center" w="150px" display="flex">
                <SkeletonCircle size="10" />
                <SkeletonText noOfLines={1} flexGrow={1} />
              </HStack>
            ) : (
              <NameView name={prescriber?.name?.full} />
            )}
          </VStack>
        </Stack>

        <Divider />

        <Text color="gray.500" fontWeight="medium" fontSize="sm">
          Instructions
        </Text>
        <HStack>
          {loading ? (
            <SkeletonText noOfLines={1} width="200px" pt={2} />
          ) : (
            <Text fontSize="md">{instructions}</Text>
          )}
        </HStack>

        <Divider />

        <Text color="gray.500" fontWeight="medium" fontSize="sm">
          Prescription Details
        </Text>

        <TableContainer w={tableWidth}>
          <Table bg="transparent">
            <Tbody>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">Status</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <Skeleton
                      width="70px"
                      height="24px"
                      borderRadius="xl"
                      ms={isMobile ? 'auto' : undefined}
                    />
                  ) : (
                    <Badge colorScheme={stateColor}>{state}</Badge>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">Quantity</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <Text fontSize="md">
                      {dispenseQuantity} ct / {daysSupply} day
                    </Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">Fills Remaining</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="30px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <Text fontSize="md">{fillsRemaining}</Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">Fills Allowed</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="30px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <Text fontSize="md">{fillsAllowed}</Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">Effective Date</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <Text fontSize="md">{effectiveDate}</Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">Expiration</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <Text fontSize="md">{expirationDate}</Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">Written</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <Text fontSize="md">{writtenAt}</Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">Dispense As Written</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="50px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <Text fontSize="md">{dispenseAsWritten ? 'Yes' : 'No'}</Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Id</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="150px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <HStack spacing={2} justifyContent={isMobile ? 'end' : 'start'}>
                      <Text
                        fontSize="md"
                        whiteSpace={isMobile ? 'nowrap' : undefined}
                        overflow={isMobile ? 'hidden' : undefined}
                        textOverflow={isMobile ? 'ellipsis' : undefined}
                        maxWidth={isMobile ? '130px' : undefined}
                      >
                        {id}
                      </Text>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        aria-label="Copy external id"
                        minW="fit-content"
                        py={0}
                        _hover={{ backgroundColor: 'transparent' }}
                        icon={<FiCopy size="1.3em" />}
                        onClick={() => navigator.clipboard.writeText(id || '')}
                      />
                    </HStack>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td ps={0} py={2} border="none">
                  <Text fontSize="md">External ID</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="65px" ms={isMobile ? 'auto' : undefined} />
                  ) : rx.externalId ? (
                    <HStack spacing={2} justifyContent={isMobile ? 'end' : 'start'}>
                      <Text
                        fontSize="md"
                        whiteSpace={isMobile ? 'nowrap' : undefined}
                        overflow={isMobile ? 'hidden' : undefined}
                        textOverflow={isMobile ? 'ellipsis' : undefined}
                        maxWidth={isMobile ? '130px' : undefined}
                      >
                        {rx.externalId}
                      </Text>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        aria-label="Copy external id"
                        minW="fit-content"
                        py={0}
                        _hover={{ backgroundColor: 'transparent' }}
                        icon={<FiCopy size="1.3em" />}
                        onClick={() => navigator.clipboard.writeText(rx.externalId || '')}
                      />
                    </HStack>
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>

        <Divider />

        <Text color="gray.500" fontWeight="medium" fontSize="sm">
          Notes
        </Text>
        <HStack>
          {loading ? (
            <SkeletonText noOfLines={1} width="200px" pt={2} />
          ) : rx.notes ? (
            <Text fontSize="md">{rx.notes}</Text>
          ) : (
            <Text fontSize="md" as="i">
              None
            </Text>
          )}
        </HStack>
      </VStack>
    </Page>
  )
}
