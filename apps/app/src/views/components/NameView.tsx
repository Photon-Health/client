import { Link as RouterLink } from 'react-router-dom';
import { Box, HStack, Link as ChakraLink, Text } from '@chakra-ui/react';

interface NameViewProps {
  name: string;
  sub?: string;
  isPatient?: boolean;
  patientId?: string;
}

const NameView = ({ name, sub = '', isPatient = false, patientId = '' }: NameViewProps) => {
  return (
    <HStack spacing="3">
      <Box>
        {isPatient ? (
          <Text fontWeight="medium" whiteSpace="nowrap" data-dd-privacy="mask" className="mp-mask">
            <ChakraLink as={RouterLink} to={`/patients/${patientId}`} style={{ textWrap: 'wrap' }}>
              {name}
            </ChakraLink>
          </Text>
        ) : (
          <Text fontWeight="medium" whiteSpace="nowrap" data-dd-privacy="mask" className="mp-mask">
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

export default NameView;
