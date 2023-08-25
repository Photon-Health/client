import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Button, HStack, Text } from '@chakra-ui/react';

interface NameViewProps {
  name: string;
  sub?: string;
  isPatient?: boolean;
  patientId?: string;
}

const NameView = (props: NameViewProps) => {
  const { name, sub, isPatient, patientId } = props;
  return (
    <HStack spacing="3">
      <Avatar name={typeof name === 'string' ? name : ''} src="" boxSize="10" />
      <Box>
        {isPatient ? (
          <Button
            as={RouterLink}
            to={`/patients/${patientId}`}
            variant="link"
            _hover={{ textDecoration: 'underline' }}
          >
            {name}
          </Button>
        ) : (
          <Text fontWeight="medium">{name}</Text>
        )}
        <Text color="muted" fontSize="sm">
          {sub}
        </Text>
      </Box>
    </HStack>
  );
};

NameView.defaultProps = { sub: '', isPatient: false, patientId: '' };

export default NameView;
