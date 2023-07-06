import { Container, Heading, Skeleton, Stack, Text, useBreakpointValue } from '@chakra-ui/react';

import { ReactNode } from 'react';

export interface PageProps {
  loading?: boolean;
  kicker?: string;
  header?: string;
  subheader?: string;
  children?: ReactNode;
  buttons?: ReactNode;
  disableScroll?: boolean;
}

export const Page = (props: PageProps) => {
  const { loading, kicker, subheader, header, buttons, children, disableScroll } = props;
  return (
    <Container py="8" flex="1" height={disableScroll ? window.innerHeight - 64 : '100%'}>
      {/* <Card> */}
      {/* <CardBody> */}
      <Stack spacing={{ base: kicker ? '3' : '8', lg: kicker ? '3' : '6' }}>
        <Stack
          spacing="4"
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'start', lg: 'center' }}
        >
          <Stack spacing="1">
            <Text color="gray.500" size="xxs" fontWeight="medium">
              {kicker}
            </Text>
            <Heading size={useBreakpointValue({ base: 'xs' })}>
              {loading ? <Skeleton height="30px" width="250px" /> : header}
            </Heading>
            <Text color="muted">{subheader}</Text>
          </Stack>
          {buttons}
        </Stack>
        {children}
      </Stack>
      {/* </CardBody> */}
      {/* </Card> */}
    </Container>
  );
};

Page.defaultProps = {
  kicker: '',
  header: '',
  subheader: '',
  children: undefined,
  buttons: undefined,
  disableScroll: false,
  loading: false
};
