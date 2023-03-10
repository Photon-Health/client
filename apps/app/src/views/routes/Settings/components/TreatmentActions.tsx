import { IconButton, HStack, useColorMode } from '@chakra-ui/react';
import { FiTrash } from 'react-icons/fi';
import { usePhoton } from '@photonhealth/react';

import { CATALOG_TREATMENTS_FIELDS } from '../../../../model/fragments';
import { confirmWrapper } from '../../../components/GuardDialog';

export const TreatmentActions = (props: {
  catalogId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  treatmentId: string;
}) => {
  const { setLoading, catalogId, treatmentId } = props;
  const { removeFromCatalog } = usePhoton();

  const [removeFromCatalogMutation] = removeFromCatalog({
    refetchQueries: ['getCatalog'],
    awaitRefetchQueries: true,
    refetchArgs: {
      id: catalogId,
      fragment: {
        CatalogTreatmentsFields: CATALOG_TREATMENTS_FIELDS
      }
    }
  });

  const { colorMode } = useColorMode();

  return (
    <HStack spacing="0" justifyContent="flex-end">
      <IconButton
        color="red.500"
        icon={<FiTrash fontSize="1.25rem" />}
        variant="ghost"
        onClick={async () => {
          const decision = await confirmWrapper('Remove this treatment?', {
            description: 'You will not be able to recover removed treatments.',
            cancelText: 'No, Keep Editing',
            confirmText: 'Yes, Cancel',
            darkMode: colorMode !== 'light',
            colorScheme: 'red'
          });
          if (decision) {
            setLoading(true);
            removeFromCatalogMutation({
              variables: {
                catalogId,
                treatmentId
              },
              onCompleted: () => setLoading(false)
            });
          }
        }}
        aria-label="Delete Template"
      />
    </HStack>
  );
};
