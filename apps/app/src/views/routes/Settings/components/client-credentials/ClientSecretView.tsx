import { useState } from 'react';

import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';

import { FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';

interface ClientSecretViewProps {
  clientId: string;
  clientSecret: string;
}

export const ClientSecretView = (props: ClientSecretViewProps) => {
  const { clientSecret } = props;
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <FormControl id={`client_secret-${props.clientId}`}>
      <FormLabel>Client Secret</FormLabel>
      <InputGroup>
        <Input
          type={show ? 'text' : 'password'}
          value={clientSecret}
          isReadOnly
          placeholder={clientSecret}
        />
        <InputRightElement>
          <HStack paddingRight={5}>
            <Button size="s" variant="ghost" onClick={handleClick}>
              {show ? <FiEye /> : <FiEyeOff />}
            </Button>
            <IconButton
              aria-label="Options"
              size="s"
              variant="ghost"
              icon={<FiCopy />}
              onClick={() => handleCopy(clientSecret)}
              colorScheme="blue"
            />
          </HStack>
        </InputRightElement>
      </InputGroup>
      <FormHelperText>The Client Secret is not base64 encoded.</FormHelperText>
    </FormControl>
  );
};
