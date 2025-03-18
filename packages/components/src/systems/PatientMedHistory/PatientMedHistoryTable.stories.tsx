import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import { PatientTreatmentHistoryElement } from './index';
import PatientMedHistoryTable from './PatientMedHistoryTable';
import { createTestPrescription, createTestTreatment } from '../../utils/storybookUtils';

type Story = StoryObj<typeof PatientMedHistoryTable>;

export const Default: Story = {
  args: {
    enableLinks: false,
    medHistory: [],
    baseURL: 'test-base-url.com/'
  }
};

const testData: PatientTreatmentHistoryElement[] = [
  {
    active: false,
    prescription: createTestPrescription({ dispenseQuantity: 30, dispenseUnit: 'unit' }),
    treatment: createTestTreatment({ name: 'treatment name 1' })
  },
  {
    active: false,
    prescription: createTestPrescription({ instructions: 'very long instructions '.repeat(10) }),
    treatment: createTestTreatment({
      name: 'treatment name 2 is very long and might get truncated on a small screen'
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
          medHistory={testData}
          baseURL={'test-base-url.com/'}
          chronological={true}
          onChronologicalChange={() => {}}
          onRefillClick={() => {}}
        ></PatientMedHistoryTable>
      </div>
    );
  }
} as Meta<ComponentProps<typeof PatientMedHistoryTable>>;
