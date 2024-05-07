import { Link, VStack } from '@chakra-ui/react';

import { formatPhone } from '../../utils';

interface ContactViewProps {
  phone: string;
  email: string;
}

const ContactView = (props: ContactViewProps) => {
  const { phone, email } = props;
  return (
    <VStack spacing="0" data-dd-privacy="mask" alignItems="start">
      <Link fontWeight="medium" href={`tel:${phone}`} isExternal>
        {formatPhone(phone)}
      </Link>
      <Link href={`mailto:${email}`} isExternal>
        {email}
      </Link>
    </VStack>
  );
};

export default ContactView;
