import { createEffect, createSignal, For, JSXElement, Show } from 'solid-js';
import Text from '../../particles/Text';
import Banner, { BannerStatus } from '../../particles/Banner';
import clsx from 'clsx';

export interface ScreeningAlertType {
  description: string;
  type: string;
  severity: string;
  involvedEntities: { id: string; name: string; __typename: string }[];
}

/**
 * Helper function to capitalize the severity
 */
const getSeverityText = (severity: string) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
};

const STATUS_TO_CLASS_MAP: Record<string, BannerStatus> = {
  MINOR: 'info',
  MODERATE: 'warning',
  MAJOR: 'error'
};

/**
 * Helper function to get class names for styling based off of the severity
 */
const getStatus = (severity: string, type: string): BannerStatus => {
  if (type === 'ALLERGEN') {
    return 'suggestion';
  }

  return STATUS_TO_CLASS_MAP[severity] ?? 'info';
};

const TYPE_TO_DESCRIPTOR_MAP: Record<string, string> = {
  PrescriptionScreeningAlertInvolvedDraftedPrescription: '(Pending Rx)',
  PrescriptionScreeningAlertInvolvedExistingPrescription: '(Existing Rx)',
  PrescriptionScreeningAlertInvolvedAllergen: '(Allergen)'
};

/**
 * Helper function to filter out entities that are the same as the owningId
 * so we don't show unnecessary duplicate information that is present
 * by nature of the association
 */
const filterOutOwningId = (
  involvedEntities: { id: string; name: string; __typename: string }[],
  owningId?: string
): { id: string; name: string; __typename: string }[] => {
  return involvedEntities.filter((element) => element.id !== owningId);
};

/**
 * Helper function to get the human readable descriptor returned by the screening endpoint
 */
const getDescriptorByType = (type: string): string => {
  return TYPE_TO_DESCRIPTOR_MAP[type] ?? '';
};

const textClasses = () => clsx('text-pretty mr-2 text-black text-base', {});

const getTitle = (props: { owningId?: string; screeningAlert: ScreeningAlertType }): JSXElement => {
  return (
    <Show
      when={props.screeningAlert.type === 'DRUG'}
      fallback={
        <Text bold class={textClasses()}>
          Allergy found
        </Text>
      }
    >
      <div class={textClasses()}>
        <span class="font-semibold">{getSeverityText(props.screeningAlert.severity)}</span>{' '}
        interaction with{' '}
        <For each={filterOutOwningId(props.screeningAlert.involvedEntities, props.owningId)}>
          {(entity, index) => {
            return (
              <>
                <span class="font-semibold">{entity.name}</span>{' '}
                {getDescriptorByType(entity.__typename)}
                {index() <
                  filterOutOwningId(props.screeningAlert.involvedEntities, props.owningId).length -
                    1 && ' and '}
              </>
            );
          }}
        </For>
      </div>
    </Show>
  );
};

/**
 * This component is used to display a single alert for prescription screening.
 *
 * The `owningId` property is used to demonstrate this alert's relationship to an entity
 * and will be used to filter out superfluous information otherwise highlighted by that relationship.
 */
export const ScreeningAlert = (props: {
  owningId?: string;
  screeningAlert: ScreeningAlertType;
}) => {
  const [isAllergen, setIsAllergen] = createSignal<boolean>();
  const [isExpanded, setIsExpanded] = createSignal<boolean>(false);

  const toggleExpandedState = () => {
    setIsExpanded(!isExpanded());
  };

  createEffect(() => {
    setIsAllergen(props.screeningAlert.type === 'ALLERGEN');
  });

  return (
    <Banner
      iconName="exclamationTriangle"
      status={getStatus(props.screeningAlert.severity, props.screeningAlert.type)}
    >
      <div class="flex grid-flow-col justify-start">
        <div class="flex flex-col gap-2">
          <div class="text-sm"> {getTitle(props)}</div>
          <Show when={isExpanded() || isAllergen()}>
            <div class={`text-sm text-gray-700`}>{props.screeningAlert.description}</div>
          </Show>

          <Show when={!isAllergen()}>
            <div
              onClick={() => {
                toggleExpandedState();
              }}
            >
              <Text bold class="text-blue-600 cursor-pointer" size="xs">
                See {isExpanded() ? 'less' : 'more'}
              </Text>
            </div>
          </Show>
        </div>
      </div>
    </Banner>
  );
};
