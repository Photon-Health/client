import { Link as RouterLink } from 'react-router-dom';
import { Link as ChakraLink, Box, HStack, Text } from '@chakra-ui/react';

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
      <Box>
        {isPatient ? (
          <ChakraLink as={RouterLink} to={`/patients/${patientId}`}>
            <Text fontWeight="medium" whiteSpace="nowrap" data-dd-privacy="mask">
              {name}
            </Text>
          </ChakraLink>
        ) : (
          <Text fontWeight="medium" whiteSpace="nowrap" data-dd-privacy="mask">
            {name}
          </Text>
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
