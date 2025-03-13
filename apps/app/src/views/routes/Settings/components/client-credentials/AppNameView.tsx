import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';

interface AppNameViewProps {
  name: string;
}

export const AppNameView = (props: AppNameViewProps) => {
  const { name } = props;

  return (
    <FormControl id="app_name">
      <FormLabel>Application Name</FormLabel>
      <InputGroup variant="outline">
        <Input value={name} isReadOnly placeholder={name} />
        <InputRightElement>
          <IconButton aria-label="Options" size="s" variant="ghost" />
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
};
