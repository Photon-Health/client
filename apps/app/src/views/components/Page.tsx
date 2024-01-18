import { Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';

import { ReactNode } from 'react';
import { datadogRum } from '@datadog/browser-rum';

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
    <Container
      py="8"
      flex="1"
      height={disableScroll ? window.innerHeight - 64 : '100%'}
      mb={{ base: 20, sm: 0 }}
      onClick={() => {
        // Track selection
        datadogRum.addAction('test_paul_selection', {
          value: 'test value'
          // orderId: order.id,
          // organization: order.organization.name,
          // timestamp: new Date().toISOString()
        });
        console.log('skdfljs');
      }}
    >
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
