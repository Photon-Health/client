import { Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';

import { ReactNode } from 'react';

export interface PageProps {
  kicker?: string;
  header?: string;
  children?: ReactNode;
  buttons?: ReactNode;
  disableScroll?: boolean;
}

export const Page = (props: PageProps) => {
  const { kicker, header, buttons, children, disableScroll } = props;
  return (
    <Container py="8" flex="1" height={disableScroll ? window.innerHeight - 64 : '100%'}>
      <Stack spacing={{ base: kicker ? '3' : '8', lg: kicker ? '3' : '6' }}>
        <Stack
          spacing="4"
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'start', lg: 'center' }}
        >
          <Heading size={useBreakpointValue({ base: 'xs' })}>{header}</Heading>
          {buttons}
        </Stack>
        {children}
      </Stack>
    </Container>
  );
};

Page.defaultProps = {
  kicker: '',
  header: '',
  subheader: '',
  children: undefined,
  buttons: undefined,
  disableScroll: false
};
