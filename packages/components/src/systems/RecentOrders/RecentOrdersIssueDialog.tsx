import { createEffect, createMemo, For, Ref } from 'solid-js';
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
import { dispatchDatadogAction } from '../../utils/dispatchDatadogAction';
import { createMutation } from '../../utils/createMutation';

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

type InputValues = {
  input: {
    subject: string;
    comment: {
      body: string;
    };
  };
};

type FillWithName = {
  name?: string;
  dispenseQuantity?: number;
  dispenseUnit?: string;
  fillsAllowed?: number;
  instructions?: string;
};
const composeTicket = ({
  patient,
  order,
  prescriptions,
  values
}: {
  patient: { id?: string; name?: string };
  order: { id?: string };
  prescriptions: FillWithName[];
  values: TicketProps;
}) => {
  const formatPrescription = (prescription: FillWithName) => `
    Name: ${prescription.name}
    Info: ${formatRxString({
      dispenseQuantity: prescription.dispenseQuantity,
      dispenseUnit: prescription.dispenseUnit,
      fillsAllowed: prescription.fillsAllowed,
      instructions: prescription.instructions
    })}
  `;

  const prescriptionsString = prescriptions.map(formatPrescription).join('\n\n');

  return `
Order:
  ID: ${order.id}

----
Patient:
  ID: ${patient.id}
  Name: ${patient.name}

----
Prescriptions:
${prescriptionsString}

----
Description:
  ${values.description}
`;
};

const formName = 'prescribe-flow-duplicate';

export default function RecentOrdersIssueDialog() {
  let ref: Ref<any> | undefined;
  const [state, actions] = useRecentOrders();
  const client = usePhotonClient();

  const [createTicketMutation, data] = createMutation<{ id: string }, InputValues>(CREATE_TICKET, {
    client: client.apolloClinical
  });

  createEffect(() => {
    if (state.isIssueDialogOpen) {
      dispatchDatadogAction('prescribe-issue-dialog-open', {}, ref);
    }
  });

  const dispatchTicketCreatedDuplicate = () => {
    // triggers the parent flow to clears the add prescription form
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
    dispatchDatadogAction('prescribe-issue-dialog-submitting', {}, ref);
    const body = composeTicket({
      patient: { id: state?.patientId, name: state?.patientName },
      order: { id: state?.orderWithIssue?.id },
      prescriptions: fills().map((fill) => ({
        name: fill?.treatment?.name,
        dispenseQuantity: fill?.prescription?.dispenseQuantity,
        dispenseUnit: fill?.prescription?.dispenseUnit,
        fillsAllowed: fill?.prescription?.fillsAllowed,
        instructions: fill?.prescription?.instructions
      })),
      values
    });

    await createTicketMutation({
      variables: {
        input: {
          subject: `Issue with ${
            state?.duplicateFill?.treatment?.name || state?.orderWithIssue?.id
          }`,
          comment: {
            body
          }
        }
      }
    });

    triggerToast({
      header: 'Issue reported',
      body: 'The customer support team will respond to you shortly.',
      status: 'success'
    });
    dispatchTicketCreatedDuplicate();
    actions.setIsIssueDialogOpen(false);
  };

  const { form, errors } = createForm({
    onSubmit: async (values) => {
      try {
        createTicket({ ...values });
      } catch (e) {
        triggerToast({
          header: 'Error Creating Issue',
          body: 'A ticket for this order has not been sent.',
          status: 'info'
        });
      }
    },
    extend: validator({ schema: ticketSchema })
  });

  return (
    <Dialog
      open={state.isIssueDialogOpen}
      onClose={() => {
        dispatchDatadogAction('prescribe-issue-dialog-exit', {}, ref);
        actions.setIsIssueDialogOpen(false);
      }}
    >
      <div class="flex flex-col gap-6" ref={ref}>
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
                    <Text size="sm">{fill?.treatment?.name}</Text>
                    <br />
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
          <Text size="xs" color="red">
            {errors().description}
          </Text>
        </form>

        <div class="flex flex-col items-stretch gap-4">
          <Button
            size="xl"
            disabled={data.loading}
            loading={data.loading}
            type="submit"
            form={formName}
          >
            Report Issue
          </Button>
          <Button
            variant="naked"
            size="xl"
            onClick={() => {
              dispatchDatadogAction('prescribe-issue-dialog-exit', {}, ref);
              actions.setIsIssueDialogOpen(false);
            }}
          >
            Go Back
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
