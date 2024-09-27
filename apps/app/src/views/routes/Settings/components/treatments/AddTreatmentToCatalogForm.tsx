import { Button, VStack, Heading, HStack, ModalFooter } from '@chakra-ui/react';
import { RefObject, useState } from 'react';
import { Formik } from 'formik';
import { TreatmentOptionSearch } from './TreatmentOptionSearch';

interface AddTreatmentToCatalogFormProps {
  loading: boolean;
  addToCatalog: Function;
  catalogId: string;
  submitRef: RefObject<any>;
  isModal?: boolean;
  onClose: () => void;
}

type SelectedTreatment = {
  medicineId: string;
};

export const AddTreatmentToCatalogForm = ({
  loading,
  addToCatalog,
  catalogId,
  submitRef,
  isModal = false,
  onClose
}: AddTreatmentToCatalogFormProps) => {
  const [selectedTreatment, setSelectedTreatment] = useState<SelectedTreatment | undefined>();

  return (
    <>
      <Formik
        initialValues={{}}
        onSubmit={async () => {
          addToCatalog({
            variables: {
              catalogId,
              treatmentId: selectedTreatment?.medicineId
            }
          });
          onClose();
        }}
      >
        {({ handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit} noValidate id="treatment-builder">
              <VStack spacing={6} align="stretch">
                <Heading as="h6" size="xxs">
                  Add Treatment To Catalog
                </Heading>
                <TreatmentOptionSearch setSelectedTreatment={setSelectedTreatment} />

                {isModal ? (
                  <ModalFooter px="0">
                    <HStack>
                      <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                      </Button>
                      <Button
                        ref={submitRef}
                        type="submit"
                        colorScheme="brand"
                        isDisabled={loading || !selectedTreatment?.medicineId}
                        isLoading={loading}
                        loadingText="Adding to catalog"
                      >
                        Add To Catalog
                      </Button>
                    </HStack>
                  </ModalFooter>
                ) : (
                  <Button
                    ref={submitRef}
                    type="submit"
                    colorScheme="brand"
                    isDisabled={loading || !selectedTreatment?.medicineId}
                    isLoading={loading}
                    loadingText="Adding to catalog"
                    mr="1"
                  >
                    Add To Catalog
                  </Button>
                )}
              </VStack>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
