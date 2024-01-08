import { createMemo, createSignal, For, Ref } from 'solid-js';
import * as zod from 'zod';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import gql from 'graphql-tag';
import triggerToast from '../../utils/toastTriggers';
import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Text from '../../particles/Text';
import Textarea from '../../particles/Textarea';
import formatRxString from '../../utils/formatRxString';
import uniqueFills from '../../utils/uniqueFills';
import { usePhotonClient } from '../SDKProvider';

const ticketSchema = zod.object({
  description: zod.string().min(1, { message: 'A description is required' })
});

type TicketProps = {
  description: string;
};

const CREATE_TICKET = gql`
  mutation CreateTicket($input: TicketInput!) {
    createTicket(input: $input) {
      id
    }
  }
`;

const composeTicket = ({
  patient,
  prescription,
  values
}: {
  patient: { id?: string; name?: string };
  prescription: {
    name?: string;
    dispenseQuantity?: number;
    dispenseUnit?: string;
    fillsAllowed?: number;
    instructions?: string;
  };
  values: TicketProps;
}) => {
  return `
Patient:
  ID: ${patient.id} 
  Name: ${patient.name}

----
Prescription:
  Name: ${prescription.name}
  Info: ${formatRxString({
    dispenseQuantity: prescription.dispenseQuantity,
    dispenseUnit: prescription.dispenseUnit,
    fillsAllowed: prescription.fillsAllowed,
    instructions: prescription.instructions
  })}

---- 
Description: 
  ${values.description}
`;
};

const formName = 'prescribe-flow-duplicate';

export default function RecentOrdersIssueDialog() {
  let ref: Ref<any> | undefined;
  const [submitting, setSubmitting] = createSignal(false);
  const [state, actions] = useRecentOrders();
  const client = usePhotonClient();

  const dispatchTicketCreatedDuplicate = () => {
    const event = new CustomEvent('photon-ticket-created-duplicate', {
      composed: true,
      bubbles: true,
      detail: {}
    });
    ref?.dispatchEvent(event);
  };

  const fills = createMemo(() => {
    if (state?.orderWithIssue) {
      return uniqueFills(state.orderWithIssue);
    }
    if (state?.duplicateFill) {
      return [state.duplicateFill];
    }
    return [];
  });

  const createTicket = async (values: TicketProps) => {
    setSubmitting(true);
    const body = composeTicket({
      patient: { id: state?.patientId, name: state?.patientName },
      prescription: {
        name: state?.duplicateFill?.treatment?.name,
        dispenseQuantity: state?.duplicateFill?.prescription?.dispenseQuantity,
        dispenseUnit: state?.duplicateFill?.prescription?.dispenseUnit,
        fillsAllowed: state?.duplicateFill?.prescription?.fillsAllowed,
        instructions: state?.duplicateFill?.prescription?.instructions
      },
      values
    });

    await client!.apolloClinical.mutate({
      mutation: CREATE_TICKET,
      variables: {
        input: {
          subject: `Issue with ${state?.duplicateFill?.treatment?.name}`,
          comment: {
            body
          }
        }
      }
    });

    setSubmitting(false);
    triggerToast({
      header: 'Ticket Created',
      body: 'A ticket for this prescription has been sent. Our team will be in touch shortly.',
      status: 'success'
    });
    dispatchTicketCreatedDuplicate();
    actions.setIsIssueDialogOpen(false);
  };

  const { form, errors } = createForm({
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        createTicket({ ...values });
      } catch (e) {
        triggerToast({
          header: 'Error Creating Ticket',
          body: 'A ticket for this order has not been sent.',
          status: 'info'
        });
      }
    },
    extend: validator({ schema: ticketSchema })
  });

  return (
    <Dialog open={state.isIssueDialogOpen} onClose={() => actions.setIsIssueDialogOpen(false)}>
      <div class="flex flex-col gap-6">
        <div>
          <Text bold class="mb-2">
            Report issue with existing order
          </Text>
          <Text>Start an email thread with the Photon team to discuss next steps.</Text>
        </div>

        <div class="border border-solid border-gray-200 rounded-lg bg-gray-50 py-3 px-4 flex flex-col gap-4">
          <div class="flex flex-col">
            <Text size="xs" color="gray">
              PATIENT
            </Text>
            <Text size="sm">{state?.patientName}</Text>
          </div>
          <div class="flex flex-col">
            <Text size="xs" color="gray">
              PRESCRIPTION
            </Text>
            <div class="flex flex-col gap-y-4">
              <For each={fills()}>
                {(fill) => (
                  <div>
                    <Text size="sm">{fill.treatment.name}</Text>
                    <Text size="sm" color="gray">
                      {formatRxString({
                        dispenseQuantity: fill?.prescription?.dispenseQuantity,
                        dispenseUnit: fill?.prescription?.dispenseUnit,
                        fillsAllowed: fill?.prescription?.fillsAllowed,
                        instructions: fill?.prescription?.instructions
                      })}
                    </Text>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        <form ref={form} class="mt-4" id={formName}>
          <Text size="xs" class="mb-2" bold>
            Description
          </Text>

          <Textarea placeholder="Describe issue with this order" name="description" />
          {errors().description}
        </form>

        <div class="flex flex-col items-stretch gap-4">
          <Button
            size="xl"
            disabled={submitting()}
            loading={submitting()}
            type="submit"
            form={formName}
          >
            Report Issue
          </Button>
          <Button variant="naked" size="xl" onClick={() => actions.setIsIssueDialogOpen(false)}>
            Go Back
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
