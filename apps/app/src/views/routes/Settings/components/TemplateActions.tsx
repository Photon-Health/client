import {
  IconButton,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
  useBreakpointValue
} from '@chakra-ui/react';
import { FiEdit, FiEye, FiMoreVertical, FiTrash } from 'react-icons/fi';

import { usePhoton } from '@photonhealth/react';

import { CATALOG_TREATMENTS_FIELDS } from '../../../../model/fragments';
import { confirmWrapper } from '../../../components/GuardDialog';

export const TemplateActions = (props: any) => {
  const { template, setSingleView, catalogId, setLoading, setTemplateToEdit, setShowModal } = props;

  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });

  const { deletePrescriptionTemplate } = usePhoton();

  const [deleteRxTemplateMutation] = deletePrescriptionTemplate({
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

  const handleEdit = () => {
    if (isMobileAndTablet) setShowModal.on();
    setTemplateToEdit(template);
  };

  return (
    <HStack justifyContent="flex-end">
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<FiMoreVertical fontSize="1.25rem" />}
          variant="ghost"
        />
        <MenuList>
          <MenuItem icon={<FiEye fontSize="1.2em" />} onClick={() => setSingleView(template)}>
            View details
          </MenuItem>
          <MenuItem icon={<FiEdit fontSize="1.2em" />} onClick={handleEdit}>
            Edit Template
          </MenuItem>
          <MenuItem
            icon={<FiTrash fontSize="1.2em" />}
            color="red.500"
            onClick={async () => {
              const decision = await confirmWrapper('Delete this prescription template?', {
                description: 'You will not be able to recover deleted prescription templates.',
                cancelText: 'Keep Editing',
                confirmText: 'Yes, Delete',
                darkMode: colorMode !== 'light',
                colorScheme: 'red'
              });
              if (decision) {
                setLoading(true);
                await deleteRxTemplateMutation({
                  variables: {
                    catalogId,
                    templateId: template.id
                  },
                  onCompleted: () => setLoading(false)
                });
              }
            }}
          >
            Delete Template
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};
