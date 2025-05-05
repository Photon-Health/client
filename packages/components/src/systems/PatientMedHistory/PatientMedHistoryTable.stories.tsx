import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import PatientMedHistoryTable, { MedHistoryRowItem } from './PatientMedHistoryTable';
import { createTestMedHistoryPrescription, createTestTreatment } from '../../utils/storybookUtils';

type Story = StoryObj<typeof PatientMedHistoryTable>;

export const Default: Story = {
  args: {
    enableLinks: false,
    enableRefillButton: false,
    medHistory: [],
    baseURL: 'test-base-url.com/'
  }
};

const testData: MedHistoryRowItem[] = [
  {
    prescription: createTestMedHistoryPrescription({
      id: 'rx-id-1',
      dispenseQuantity: 30,
      dispenseUnit: 'unit'
    }),
    treatment: createTestTreatment({ name: 'treatment name 1' })
  },
  {
    prescription: createTestMedHistoryPrescription({
      instructions: 'very long instructions '.repeat(10)
    }),
    treatment: createTestTreatment({
      name: 'treatment name 2 is very long and might get truncated on a small screen'
    })
  },
  {
    prescription: undefined,
    treatment: createTestTreatment({
      name: 'External Medication'
    })
  }
];

export default {
  title: 'Patient Medication History Table',
  tags: ['autodocs'],
  render: (props) => {
    return (
      <div>
        <PatientMedHistoryTable
          enableLinks={props.enableLinks}
          enableRefillButton={props.enableRefillButton}
          rowItems={testData}
          baseURL={'test-base-url.com/'}
          sortOrder={'desc'}
          isLoading={false}
          onSortOrderToggle={() => {}}
        ></PatientMedHistoryTable>
      </div>
    );
  }
} as Meta<ComponentProps<typeof PatientMedHistoryTable>>;
