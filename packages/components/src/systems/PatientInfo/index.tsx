import { JSXElement, Show, createMemo } from 'solid-js';
import { parsePhoneNumber } from 'awesome-phonenumber';
import { Address, Patient } from '@photonhealth/sdk/dist/types';
import Button from '../../particles/Button';
import Text from '../../particles/Text';
import Card from '../../particles/Card';
import formatDate from '../../utils/formatDate';
import Collapsible from '../../particles/Collapsible';

type InfoRowProps = {
  label: string;
  children: JSXElement | JSXElement[];
};

const InfoRow = (props: InfoRowProps) => {
  return (
    <tr>
      <td class="align-top py-1 w-20">
        <Text size="sm" color="gray">
          {props.label}
        </Text>
      </td>
      <td class="align-top py-1">{props.children}</td>
    </tr>
  );
};

type PatientInfoProps = {
  patient?: Patient;
  loading?: boolean;
  weight?: number;
  weightUnit?: string;
  editPatient?: () => void;
  address?: Address;
};

export default function PatientInfo(props: PatientInfoProps) {
  const phoneNumber = createMemo(() => {
    if (props.patient?.phone) {
      const pn = parsePhoneNumber(props.patient?.phone);
      return pn.valid ? pn.number.national : props.patient.phone;
    }
    return '';
  });

  return (
    <Card addChildrenDivider={true}>
      <div class="flex items-center justify-between">
        <Text color="gray">Patient Info</Text>
        <Show when={props.editPatient}>
          <Button variant="secondary" size="sm" onClick={props.editPatient}>
            Edit patient
          </Button>
        </Show>
      </div>
      <div class="pt-2" data-dd-privacy="mask">
        <Text size="lg" bold sampleLoadingText="Sally Patient">
          {props.patient?.name.full || 'N/A'}
        </Text>
        <Collapsible
          openLabel="Show less"
          closedLabel="Show more"
          // On larger screens, force component open and hide control
          // Can't use alwaysOpen prop until there is a way to
          // get screen breakpoint programatically
          class="sm:block"
          buttonClass="mt-2 sm:hidden"
        >
          <div class="sm:grid sm:grid-cols-2 sm:gap-2">
            <table class="table-auto">
              <tbody>
                <InfoRow label="Email">
                  <Text size="sm" loading={props.loading} sampleLoadingText="fake@email.com">
                    {props.patient?.email || 'N/A'}
                  </Text>
                </InfoRow>
                <InfoRow label="Phone">
                  <Text size="sm" loading={props.loading} sampleLoadingText="555-555-5555">
                    {phoneNumber() || 'N/A'}
                  </Text>
                </InfoRow>
                <InfoRow label="Address">
                  <Show when={!props.patient || props.address} fallback={<div>N/A</div>}>
                    <div>
                      <Text size="sm" loading={props.loading} sampleLoadingText="123 Fake St">
                        {props.address?.street1}
                      </Text>
                    </div>
                    <Show when={!props.patient || props.address?.street2}>
                      <div>
                        <Text size="sm" loading={props.loading} sampleLoadingText="Apt 3">
                          {props.address?.street2}
                        </Text>
                      </div>
                    </Show>
                    <div>
                      <Text
                        size="sm"
                        loading={props.loading}
                        sampleLoadingText="Brooklyn, NY 11221"
                      >
                        {props.address?.city}, {props.address?.state} {props.address?.postalCode}
                      </Text>
                    </div>
                  </Show>
                </InfoRow>
              </tbody>
            </table>

            <table class="table-auto">
              <tbody>
                <InfoRow label="DOB">
                  <Text size="sm" loading={props.loading} sampleLoadingText="female">
                    {formatDate(props.patient?.dateOfBirth || 'N/A')}
                  </Text>
                </InfoRow>
                <InfoRow label="Weight">
                  <Text size="sm" loading={props.loading} sampleLoadingText="150 lbs">
                    {props?.weight ? `${props.weight} ${props.weightUnit}` : 'N/A'}
                  </Text>
                </InfoRow>
                <InfoRow label="Sex">
                  <Text size="sm" loading={props.loading} sampleLoadingText="female">
                    {props.patient?.sex || 'N/A'}
                  </Text>
                </InfoRow>
                <InfoRow label="Gender">
                  <Text size="sm" loading={props.loading} sampleLoadingText="female">
                    {props.patient?.gender || 'N/A'}
                  </Text>
                </InfoRow>
              </tbody>
            </table>
          </div>
        </Collapsible>
      </div>
    </Card>
  );
}
