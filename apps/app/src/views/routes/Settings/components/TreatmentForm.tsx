import { Button, VStack, Heading, HStack, ModalFooter, useToast } from '@chakra-ui/react';
import { RefObject, useState } from 'react';
import { Formik } from 'formik';

import { AdvancedDrugSearch } from '../../../components/AdvancedDrugSearch';

interface TreatmentFormProps {
  loading: boolean;
  addToCatalogMutation: Function;
  catalogId: string;
  submitRef: RefObject<any>;
  isModal?: boolean;
  onClose: () => void;
}

export type SelectedProduct = {
  name: string;
  id: string;
};

export const TreatmentForm = ({
  loading,
  addToCatalogMutation,
  catalogId,
  submitRef,
  isModal,
  onClose
}: TreatmentFormProps) => {
  const toast = useToast();
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | undefined>();

  return (
    <Formik
      initialValues={{}}
      onSubmit={async () => {
        addToCatalogMutation({
          variables: {
            catalogId,
            treatmentId: selectedProduct?.id
          },
          onCompleted: () => {
            if (isModal) onClose();
            toast({
              title: 'Treatment added',
              status: 'success'
            });
          }
        });
      }}
    >
      {({ handleSubmit }) => {
        return (
          <form onSubmit={handleSubmit} noValidate id="treatment-builder">
            <VStack spacing={6} align="stretch">
              <Heading as="h6" size="xxs">
                Add Treatment To Catalog
              </Heading>
              <AdvancedDrugSearch
                submitRef={submitRef}
                hideAddToCatalog
                loading={loading}
                forceMobile
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
              />
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
                      disabled={loading}
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
                  disabled={loading}
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
  );
};

TreatmentForm.defaultProps = {
  isModal: false
};
