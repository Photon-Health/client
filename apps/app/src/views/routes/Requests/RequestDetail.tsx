import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  Card,
  CardBody,
  HStack,
  Link,
  SimpleGrid,
  SkeletonText,
  Stack,
  Text,
  useColorMode,
  useToast,
  VStack
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { usePhoton } from '@photonhealth/react';

import { Page } from '../../components/Page';
import { StyledToast } from '../../components/StyledToast';
import { confirmWrapper } from '../../components/GuardDialog';
import { formatDateLongUTC } from '../../../utils';
import {
  approveDraftRequest,
  claimRequest,
  DraftRequest,
  fetchDraftRequest,
  requestsConfig
} from './requests';
import { UrgencyBadge } from '.';

const SectionLabel = ({ children }: { children: string }) => (
  <Text fontSize="xs" fontWeight="semibold" letterSpacing="wider" color="gray.500" mb={4}>
    {children.toUpperCase()}
  </Text>
);

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <VStack align="start" spacing={0.5}>
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
    <Text>{value === undefined || value === null || value === '' ? '—' : value}</Text>
  </VStack>
);

const IntakeCard = ({ request }: { request: DraftRequest }) => {
  const dob = request.patient?.demographic?.dateOfBirth;
  return (
    <Card variant="outline" h="fit-content">
      <CardBody>
        <SectionLabel>Intake answers</SectionLabel>
        <Stack spacing={4}>
          {request.intakeAnswers.map((answer, i) => (
            <Field key={i} label={answer.label || 'Note'} value={answer.value} />
          ))}
          <Field
            label="Date of birth"
            value={
              dob
                ? `${formatDateLongUTC(dob)}${request.age !== undefined ? ` (${request.age})` : ''}`
                : undefined
            }
          />
          <Field label="State" value={request.state} />
        </Stack>
      </CardBody>
    </Card>
  );
};

const PrescriptionCard = ({ request }: { request: DraftRequest }) => {
  const { pharmacy } = request;
  const pharmacyAddress = [pharmacy?.address?.street1, pharmacy?.address?.city]
    .filter(Boolean)
    .join(', ');
  return (
    <Card variant="outline" h="fit-content">
      <CardBody>
        <SectionLabel>Draft prescription</SectionLabel>
        <Stack spacing={6}>
          {request.prescriptions.map((rx) => (
            <Stack key={rx.id} spacing={4}>
              <Text fontSize="xl" fontWeight="medium">
                {rx.treatment.name}
              </Text>
              <Field
                label="Quantity"
                value={
                  rx.dispense?.quantity !== undefined && rx.dispense?.quantity !== null
                    ? `${rx.dispense.quantity} ${rx.dispense.unit ?? ''}`.trim()
                    : undefined
                }
              />
              <Field label="Directions" value={rx.instructions} />
              <Field label="Refills" value={rx.dispense?.refillsAllowed ?? 0} />
            </Stack>
          ))}
          <Field
            label="Pharmacy"
            value={
              pharmacy
                ? [pharmacy.name, pharmacyAddress].filter(Boolean).join(' · ')
                : 'Patient will choose'
            }
          />
        </Stack>
      </CardBody>
    </Card>
  );
};

export const RequestDetail = () => {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { getToken, user } = usePhoton();

  const [request, setRequest] = useState<DraftRequest>();
  const [loadError, setLoadError] = useState<string>();
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    claimRequest(requestId);
    fetchDraftRequest(requestId, requestsConfig().ppToken)
      .then(setRequest)
      .catch((e) => setLoadError(String(e?.message ?? e)));
  }, [requestId]);

  const showToast = (type: 'success' | 'error', title: string, description: string) =>
    toast({
      position: 'top-right',
      duration: type === 'error' ? 8000 : 4000,
      render: ({ onClose }) => (
        <StyledToast onClose={onClose} type={type} title={title} description={description} />
      )
    });

  const onApprove = async () => {
    if (!request) return;
    const decision = await confirmWrapper('Approve and send this prescription?', {
      description: `You're signing ${request.medication} for ${request.patientName} under your organization and sending it to the pharmacy.`,
      cancelText: 'Cancel',
      confirmText: 'Approve & send',
      darkMode: colorMode !== 'light',
      colorScheme: 'blue'
    });
    if (!decision) return;

    setApproving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Unable to get your access token — try logging in again');
      const orderId = await approveDraftRequest(
        request,
        token,
        `Approved from Requests inbox by ${user?.name ?? 'provider'}`
      );
      showToast('success', 'Prescription sent', `Order ${orderId} was created and sent.`);
      navigate('/requests');
    } catch (e) {
      showToast('error', 'Unable to approve request', String((e as Error)?.message ?? e));
    } finally {
      setApproving(false);
    }
  };

  const header = request ? `${request.patientName} · ${request.medication}` : 'Request';

  return (
    <Page
      header={
        <VStack align="start" spacing={2}>
          <Link as={RouterLink} to="/requests" color="blue.500" fontSize="md" fontWeight="medium">
            <HStack spacing={1}>
              <FiArrowLeft />
              <Text>Requests</Text>
            </HStack>
          </Link>
          <Text>{header}</Text>
        </VStack>
      }
      buttons={
        request && (
          <HStack>
            <Badge colorScheme="blue" textTransform="none" fontWeight="medium" px={2} py={0.5}>
              Claimed by you
            </Badge>
            <UrgencyBadge urgency={request.urgency} />
          </HStack>
        )
      }
    >
      {loadError ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>This request couldn&apos;t be loaded: {loadError}</AlertDescription>
        </Alert>
      ) : !request ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <SkeletonText noOfLines={8} spacing={4} />
          <SkeletonText noOfLines={8} spacing={4} />
        </SimpleGrid>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="start">
            <IntakeCard request={request} />
            <PrescriptionCard request={request} />
          </SimpleGrid>
          <HStack spacing={4} pt={4}>
            {/* Decline is intentionally a no-op for v1 */}
            <Button variant="outline" colorScheme="red" isDisabled={approving}>
              Decline
            </Button>
            <Button
              colorScheme="blue"
              onClick={onApprove}
              isLoading={approving}
              loadingText="Sending..."
            >
              Approve &amp; send
            </Button>
          </HStack>
        </>
      )}
    </Page>
  );
};
