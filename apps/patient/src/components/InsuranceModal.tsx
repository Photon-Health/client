import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import { patientAnalytics } from '../configs/analytics';
import { useOrderContext } from '../views/Main';

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: InsuranceFormData) => void;
}

export interface InsuranceFormData {
  provider: string;
  memberId: string;
  groupNumber: string;
  rxBin: string;
}

const INSURANCE_PROVIDERS = [
  { value: 'aetna', label: 'Aetna' },
  { value: 'anthem-blue-cross', label: 'Anthem / Blue Cross Blue Shield' },
  { value: 'cigna', label: 'Cigna' },
  { value: 'humana', label: 'Humana' },
  { value: 'united-healthcare', label: 'UnitedHealthcare' },
  { value: 'kaiser-permanente', label: 'Kaiser Permanente' },
  { value: 'cvs-caremark', label: 'CVS Caremark' },
  { value: 'express-scripts', label: 'Express Scripts' },
  { value: 'optumrx', label: 'OptumRx' },
  { value: 'tricare-military', label: 'Tricare / Military' },
  { value: 'medicare-part-d', label: 'Medicare (Part D)' },
  { value: 'medicaid-state-plan', label: 'Medicaid (State Plan)' },
  { value: 'other', label: 'Other' }
];

// TODO: This is currently a fake door test component, I assume it will be modified and hardened
// before going into production collecting actual insurance information.
export const InsuranceModal = ({ isOpen, onClose, onSubmit }: InsuranceModalProps) => {
  const { order } = useOrderContext();
  const [provider, setProvider] = useState('');
  const [memberId, setMemberId] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [rxBin, setRxBin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getFormData = () => ({
    provider,
    memberId,
    groupNumber,
    rxBin
  });

  const isFormValid = () => {
    const hasProvider = provider.trim() !== '';
    const hasAtLeastOneOther =
      memberId.trim() !== '' || groupNumber.trim() !== '' || rxBin.trim() !== '';
    return hasProvider && hasAtLeastOneOther;
  };

  const handleSubmit = () => {
    if (order) {
      patientAnalytics.track('Insurance Form Submitted', order, getFormData());
    }

    if (onSubmit) {
      onSubmit({
        provider,
        memberId,
        groupNumber,
        rxBin
      });
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    if (order) {
      patientAnalytics.track('Insurance Modal Closed', order, getFormData());
    }

    // Reset form on close
    setProvider('');
    setMemberId('');
    setGroupNumber('');
    setRxBin('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full">
      <ModalOverlay />
      <ModalContent backgroundColor="gray.100" alignItems="center" w="full">
        <ModalHeader
          paddingX="4"
          paddingBottom="4"
          paddingTop="4"
          fontSize="2xl"
          fontWeight="700"
          backgroundColor="gray.100"
          w="full"
          alignItems="center"
        >
          <Text maxWidth="xl" marginX="auto" textAlign="left" w="full">
            Enter insurance info
          </Text>
        </ModalHeader>
        <ModalBody
          padding="4"
          rowGap="4"
          backgroundColor="gray.100"
          w="full"
          alignItems="center"
          paddingBottom="32"
        >
          <VStack rowGap="6" marginX="auto" maxWidth="xl" w="full" align="stretch">
            <Text>
              Please fill in as much detail as you can. It improves our chances of showing a price,
              though one may not always be available.
            </Text>

            <FormControl isRequired>
              <FormLabel htmlFor="insurance-provider">Health Insurance Provider</FormLabel>
              <Select
                id="insurance-provider"
                name="insurance-provider"
                title="Health Insurance Provider"
                aria-label="Health Insurance Provider"
                placeholder="Select insurance"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                backgroundColor="white"
              >
                {INSURANCE_PROVIDERS.map((providerOption) => (
                  <option key={providerOption.value} value={providerOption.value}>
                    {providerOption.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="rx-bin">Rx BIN</FormLabel>
              <Input
                id="rx-bin"
                name="rx-bin"
                placeholder="e.g. 076123"
                value={rxBin}
                onChange={(e) => setRxBin(e.target.value)}
                backgroundColor="white"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="member-id">Member ID</FormLabel>
              <Input
                id="member-id"
                name="member-id"
                placeholder="e.g. W0987654321"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                backgroundColor="white"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="group-number">Group Number (GRP)</FormLabel>
              <Input
                id="group-number"
                name="group-number"
                placeholder="e.g. ABCDE"
                value={groupNumber}
                onChange={(e) => setGroupNumber(e.target.value)}
                backgroundColor="white"
              />
            </FormControl>

            <Text fontSize="sm" color="gray.500">
              At least one of Rx BIN, Member ID, or Group Number is required
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter position="sticky" bottom="0" w="full" padding="4" backgroundColor="gray.100">
          <VStack w="full" rowGap="3" maxWidth="xl" marginX="auto">
            <Button
              w="full"
              colorScheme="blue"
              onClick={handleSubmit}
              isDisabled={!isFormValid()}
              isLoading={isLoading}
            >
              Submit
            </Button>
            <Button w="full" variant="outline" onClick={handleClose}>
              Close
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
