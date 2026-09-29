import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  SkeletonText,
  Stack,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { usePhoton } from '@photonhealth/react';

import { Page } from '../../components/Page';
import { StyledToast } from '../../components/StyledToast';
import { confirmWrapper } from '../../components/GuardDialog';
import { formatDateLongUTC } from '../../../utils';
import { AskPatientDrawer } from './AskPatientDrawer';
import { Field, SectionLabel, StatusBadge, UrgencyBadge } from './components';
import {
  approveRequest,
  askPatient,
  claimRequest,
  declineRequest,
  describeRequest,
  DraftOrderDetail,
  fetchPatientHistory,
  fetchRequest,
  followUpQuestions,
  formatAnswer,
  intakeQuestions,
  PatientQuestion,
  PrescriptionEdit,
  PrescriptionEdits,
  requestStatus
} from './requests';

type PatientHistory = Awaited<ReturnType<typeof fetchPatientHistory>>;

const IntakeCard = ({ draft }: { draft: DraftOrderDetail }) => {
  const { age, state } = describeRequest(draft);
  const patient = draft.order.patient?.__typename === 'Patient' ? draft.order.patient : undefined;
  const dob = patient?.demographic?.dateOfBirth;
  const allergies = patient?.clinical?.allergies.map((a) => a.name).join(', ');
  return (
    <Card variant="outline" h="fit-content">
      <CardBody>
        <SectionLabel>Intake answers</SectionLabel>
        <Stack spacing={4}>
          {intakeQuestions(draft).map((question) => (
            <Field
              key={question.id}
              label={question.text}
              value={formatAnswer(question.answer) ?? 'Not answered'}
            />
          ))}
          <Field label="Allergies" value={allergies || 'None reported'} />
          <Field
            label="Date of birth"
            value={
              dob ? `${formatDateLongUTC(dob)}${age !== undefined ? ` (${age})` : ''}` : undefined
            }
          />
          <Field label="State" value={state} />
        </Stack>
      </CardBody>
    </Card>
  );
};

const PrescriptionCard = ({
  draft,
  editing,
  edits,
  onEdit
}: {
  draft: DraftOrderDetail;
  editing: boolean;
  edits: PrescriptionEdits;
  onEdit: (prescriptionId: string, edit: PrescriptionEdit) => void;
}) => {
  const { pharmacy } = draft.order;
  const pharmacyAddress = [pharmacy?.address?.street1, pharmacy?.address?.city]
    .filter(Boolean)
    .join(', ');
  return (
    <Card variant="outline" h="fit-content">
      <CardBody>
        <SectionLabel>Draft prescription</SectionLabel>
        <Stack spacing={6}>
          {draft.order.prescriptions.map((rx) => {
            const edit = edits[rx.id] ?? {};
            const quantity = edit.quantity ?? rx.dispense?.quantity;
            const instructions = edit.instructions ?? rx.instructions;
            const refills = edit.refillsAllowed ?? rx.dispense?.refillsAllowed ?? 0;
            return (
              <Stack key={rx.id} spacing={4}>
                <Text fontSize="xl" fontWeight="medium">
                  {rx.treatment.name}
                </Text>
                {editing ? (
                  <>
                    <FormControl>
                      <FormLabel>
                        Quantity{rx.dispense?.unit ? ` (${rx.dispense.unit})` : ''}
                      </FormLabel>
                      <NumberInput
                        min={0}
                        value={quantity ?? ''}
                        onChange={(_, value) =>
                          onEdit(rx.id, {
                            ...edit,
                            quantity: Number.isNaN(value) ? undefined : value
                          })
                        }
                      >
                        <NumberInputField aria-label="Quantity" />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Directions</FormLabel>
                      <Textarea
                        aria-label="Directions"
                        value={instructions ?? ''}
                        onChange={(e) => onEdit(rx.id, { ...edit, instructions: e.target.value })}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Refills</FormLabel>
                      <NumberInput
                        min={0}
                        value={refills}
                        onChange={(_, value) =>
                          onEdit(rx.id, {
                            ...edit,
                            refillsAllowed: Number.isNaN(value) ? undefined : value
                          })
                        }
                      >
                        <NumberInputField aria-label="Refills" />
                      </NumberInput>
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Field
                      label="Quantity"
                      value={
                        quantity !== undefined && quantity !== null
                          ? `${quantity} ${rx.dispense?.unit ?? ''}`.trim()
                          : undefined
                      }
                    />
                    <Field label="Directions" value={instructions} />
                    <Field label="Refills" value={refills} />
                  </>
                )}
              </Stack>
            );
          })}
          <Field
            label="Pharmacy"
            value={
              pharmacy
                ? [pharmacy.name, pharmacyAddress].filter(Boolean).join(' · ')
                : 'Patient will choose'
            }
          />
          {editing && (
            <Text fontSize="sm" color="gray.500">
              Your edits replace what the patient requested when you approve.
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

const monthYear = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

const FlagsCard = ({ draft, history }: { draft: DraftOrderDetail; history?: PatientHistory }) => {
  const alerts = draft.order.prescriptions.flatMap((rx) => rx.screeningAlerts ?? []);
  const fills = (history ?? []).filter(
    (entry) => entry.order.state !== 'DRAFT' && entry.order.state !== 'CANCELED'
  );
  return (
    <Card variant="outline" h="fit-content">
      <CardBody>
        <SectionLabel>Flags from Photon history</SectionLabel>
        <Stack spacing={3}>
          {alerts.length ? (
            alerts.map((alert, i) => (
              <Box key={i} bg="yellow.50" _dark={{ bg: 'yellow.900' }} borderRadius="md" p={4}>
                <Text fontWeight="medium" color="orange.600" _dark={{ color: 'orange.200' }}>
                  {alert.type} · {alert.severity}
                </Text>
                <Text fontSize="sm">{alert.description}</Text>
              </Box>
            ))
          ) : (
            <Box bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md" p={4}>
              <Text fontWeight="medium">No known interactions</Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                Screening found nothing against this patient&apos;s history.
              </Text>
            </Box>
          )}
        </Stack>
        <Box mt={6}>
          <SectionLabel>Fill history</SectionLabel>
          {history === undefined ? (
            <SkeletonText noOfLines={3} />
          ) : fills.length ? (
            <Stack spacing={3}>
              {fills.map((entry) => (
                <VStack key={entry.order.id} align="start" spacing={0}>
                  <Text fontWeight="medium">
                    {entry.order.prescriptions.map((rx) => rx.treatment.name).join(', ') || 'Order'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {monthYear(entry.createdAt)}
                  </Text>
                </VStack>
              ))}
            </Stack>
          ) : (
            <Text color="gray.500">No previous fills</Text>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

const FollowUpCard = ({ draft }: { draft: DraftOrderDetail }) => {
  const questions = followUpQuestions(draft);
  if (!questions.length) return null;
  return (
    <Card variant="outline" h="fit-content">
      <CardBody>
        <SectionLabel>Your questions</SectionLabel>
        <Stack spacing={4}>
          {questions.map((question) => (
            <Field
              key={question.id}
              label={question.text}
              value={formatAnswer(question.answer) ?? 'Waiting for the patient'}
            />
          ))}
        </Stack>
      </CardBody>
    </Card>
  );
};

const OutcomeAlert = ({ draft }: { draft: DraftOrderDetail }) => {
  if (!draft.outcome) return null;
  const sent = draft.outcome.status === 'SUBMITTED';
  return (
    <Alert status={sent ? 'success' : 'warning'} borderRadius="md">
      <AlertIcon />
      <AlertDescription>
        {sent
          ? `Approved and sent as order ${draft.outcome.orderId}.`
          : `Declined: ${draft.outcome.rejectionReason}`}
      </AlertDescription>
    </Alert>
  );
};

const DeclineDialog = ({
  isOpen,
  onClose,
  onDecline
}: {
  isOpen: boolean;
  onClose: () => void;
  onDecline: (reason: string) => Promise<void>;
}) => {
  const [reason, setReason] = useState('');
  const [declining, setDeclining] = useState(false);
  const decline = async () => {
    setDeclining(true);
    try {
      await onDecline(reason.trim());
      onClose();
    } finally {
      setDeclining(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Decline this request?</ModalHeader>
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>Reason</FormLabel>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="outline" onClick={onClose} isDisabled={declining}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={decline}
            isDisabled={!reason.trim()}
            isLoading={declining}
          >
            Decline request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const RequestDetail = () => {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { getToken, user } = usePhoton();
  const askDrawer = useDisclosure();
  const declineDialog = useDisclosure();

  const [draft, setDraft] = useState<DraftOrderDetail>();
  const [history, setHistory] = useState<PatientHistory>();
  const [loadError, setLoadError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState<PrescriptionEdits>({});

  const showToast = useCallback(
    (type: 'success' | 'error', title: string, description: string) =>
      toast({
        position: 'top-right',
        duration: type === 'error' ? 8000 : 4000,
        render: ({ onClose }) => (
          <StyledToast onClose={onClose} type={type} title={title} description={description} />
        )
      }),
    [toast]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const loaded = await fetchRequest(requestId, token);
        if (cancelled) return;
        setDraft(loaded);
        const { photonPpPatientId } = describeRequest(loaded);
        if (loaded.claim && photonPpPatientId) {
          const loadedHistory = await fetchPatientHistory(photonPpPatientId, token).catch(() => []);
          if (!cancelled) setHistory(loadedHistory);
        } else {
          setHistory([]);
        }
      } catch (e) {
        if (!cancelled) setLoadError(String((e as Error)?.message ?? e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestId, getToken]);

  const run = async (action: () => Promise<void>, failureTitle: string) => {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      showToast('error', failureTitle, String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  const onClaim = () =>
    run(async () => setDraft(await claimRequest(requestId, await getToken())), 'Unable to claim');

  const onAsk = async (question: PatientQuestion) => {
    try {
      setDraft(await askPatient(requestId, question, await getToken()));
      showToast('success', 'Question sent', 'The request is now waiting on the patient.');
    } catch (e) {
      showToast('error', 'Unable to send the question', String((e as Error)?.message ?? e));
      throw e;
    }
  };

  const onDecline = async (reason: string) => {
    try {
      setDraft(await declineRequest(requestId, reason, await getToken()));
      showToast('success', 'Request declined', 'It has moved to Closed.');
    } catch (e) {
      showToast('error', 'Unable to decline', String((e as Error)?.message ?? e));
      throw e;
    }
  };

  const onApprove = async () => {
    if (!draft) return;
    const { medication, patientName } = describeRequest(draft);
    const decision = await confirmWrapper('Approve and send this prescription?', {
      description: `You're signing ${medication} for ${patientName} under your organization and sending it to the pharmacy.`,
      cancelText: 'Cancel',
      confirmText: 'Approve & send',
      darkMode: colorMode !== 'light',
      colorScheme: 'blue'
    });
    if (!decision) return;

    await run(async () => {
      const sent = await approveRequest(
        draft,
        editing ? edits : {},
        await getToken(),
        `Approved from Requests by ${user?.name ?? 'provider'}`
      );
      setDraft(sent);
      setEditing(false);
      showToast('success', 'Prescription sent', `Order ${sent.outcome?.orderId} was sent.`);
      navigate('/requests?tab=closed');
    }, 'Unable to approve request');
  };

  const request = draft ? describeRequest(draft) : undefined;
  const isOpen = !!draft && !draft.outcome;
  const canAct = isOpen && !!draft?.claim;

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
          <Text>{request ? `${request.patientName} · ${request.medication}` : 'Request'}</Text>
        </VStack>
      }
      buttons={
        draft &&
        request && (
          <HStack>
            <StatusBadge status={requestStatus(draft)} />
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
      ) : !draft || !request ? (
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          <SkeletonText noOfLines={8} spacing={4} />
          <SkeletonText noOfLines={8} spacing={4} />
          <SkeletonText noOfLines={8} spacing={4} />
        </SimpleGrid>
      ) : (
        <>
          <OutcomeAlert draft={draft} />
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} alignItems="start">
            <Stack spacing={6}>
              <IntakeCard draft={draft} />
              <FollowUpCard draft={draft} />
            </Stack>
            <PrescriptionCard
              draft={draft}
              editing={editing}
              edits={edits}
              onEdit={(id, edit) => setEdits((current) => ({ ...current, [id]: edit }))}
            />
            <FlagsCard draft={draft} history={history} />
          </SimpleGrid>
          {isOpen && !draft.claim && (
            <HStack spacing={4} pt={4}>
              <Button colorScheme="blue" onClick={onClaim} isLoading={busy}>
                Claim
              </Button>
            </HStack>
          )}
          {canAct && (
            <HStack spacing={4} pt={4}>
              <Button
                variant="outline"
                colorScheme="red"
                onClick={declineDialog.onOpen}
                isDisabled={busy}
              >
                Decline
              </Button>
              <Button variant="outline" onClick={askDrawer.onOpen} isDisabled={busy}>
                Ask patient
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing((current) => !current);
                  setEdits({});
                }}
                isDisabled={busy}
              >
                {editing ? 'Discard changes' : 'Modify'}
              </Button>
              <Button
                colorScheme="blue"
                onClick={onApprove}
                isLoading={busy}
                loadingText="Sending..."
              >
                Approve &amp; send
              </Button>
            </HStack>
          )}
          <AskPatientDrawer
            isOpen={askDrawer.isOpen}
            onClose={askDrawer.onClose}
            patientFirstName={request.patientName.split(' ')[0]}
            medication={request.medication}
            onSend={onAsk}
          />
          <DeclineDialog
            isOpen={declineDialog.isOpen}
            onClose={declineDialog.onClose}
            onDecline={onDecline}
          />
        </>
      )}
    </Page>
  );
};
