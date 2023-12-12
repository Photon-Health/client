import { Link, Stack } from '@chakra-ui/react';

import { formatPhone } from '../../utils';

interface ContactViewProps {
  phone: string;
  email: string;
}

const ContactView = (props: ContactViewProps) => {
  const { phone, email } = props;
  return (
    <Stack spacing="0" data-dd-privacy="mask">
      <Link fontWeight="medium" href={`tel:${phone}`} isExternal>
        {formatPhone(phone)}
      </Link>
      <Link href={`mailto:${email}`} isExternal>
        {email}
      </Link>
    </Stack>
  );
};

export default ContactView;
