import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { FiCopy } from 'react-icons/fi';

interface ClientIdViewProps {
  clientId: string;
}

export const ClientIdView = (props: ClientIdViewProps) => {
  const { clientId } = props;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <FormControl id="client_id">
      <FormLabel>Client ID</FormLabel>
      <InputGroup variant="outline">
        <Input value={clientId} isReadOnly placeholder={clientId} />
        <InputRightElement>
          <IconButton
            aria-label="Options"
            size="s"
            variant="ghost"
            icon={<FiCopy />}
            onClick={() => handleCopy(clientId)}
          />
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
};
