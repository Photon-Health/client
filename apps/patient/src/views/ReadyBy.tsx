import { useState } from 'react';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';

import { FixedFooter } from '../components/FixedFooter';
import { Nav } from '../components/Nav';
import { PoweredBy } from '../components/PoweredBy';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';

const checkDisabled = (option: string): boolean => {
  const currentTime = dayjs();
  const timetoCheckDayJs = dayjs(option, 'h:mm a');
  return currentTime.isAfter(timetoCheckDayJs);
};

export const ReadyBy = () => {
  const { order } = useOrderContext();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const navigate = useNavigate();

  const { organization } = order;

  const [selected, setSelected] = useState(undefined);
  const showFooter = typeof selected !== 'undefined';

  const handleCtaClick = () => {
    navigate(`/pharmacy?orderId=${order.id}&token=${token}`);
  };

  return (
    <Box>
      <Helmet>
        <title>{t.readyBy.title}</title>
      </Helmet>

      <Nav header={organization.name} orgId={organization.id} />

      <Container pb={showFooter ? 32 : 8}>
        <VStack spacing={7} pt={5} align="span">
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.readyBy.heading}
            </Heading>
            <Text>{t.readyBy.subheading}</Text>
          </VStack>

          <VStack spacing={3} w="full">
            {t.readyBy.options.map((option, i) => {
              const isDisabled = checkDisabled(option);
              return (
                <Button
                  key={option}
                  bgColor={selected === i ? 'gray.700' : undefined}
                  _active={
                    !isDisabled
                      ? {
                          bgColor: 'gray.700',
                          textColor: 'white'
                        }
                      : undefined
                  }
                  size="lg"
                  w="full"
                  isActive={selected === i}
                  onClick={() => setSelected(i)}
                  isDisabled={isDisabled}
                >
                  {option}
                </Button>
              );
            })}
          </VStack>
        </VStack>
      </Container>

      <FixedFooter show={showFooter}>
        <Container as={VStack} w="full">
          <Button size="lg" w="full" variant="brand" onClick={handleCtaClick}>
            {t.readyBy.cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
