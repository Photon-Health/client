import { useState } from 'react';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';
import { datadogRum } from '@datadog/browser-rum';

import { FixedFooter, Nav, PoweredBy } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';

const checkDisabled = (option: string): boolean => {
  const currentTime = dayjs();
  const timetoCheckDayJs = dayjs(option, 'h:mm a');
  return currentTime.isAfter(timetoCheckDayJs);
};

export const Urgency = () => {
  const { order, flattenedFills } = useOrderContext();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const navigate = useNavigate();

  const [selectedIdx, setSelectedIdx] = useState(undefined);
  const showFooter = typeof selectedIdx !== 'undefined';

  const handleCtaClick = () => {
    if (!isDemo) {
      // Track selection
      datadogRum.addAction('urgency_selection', {
        value: t.urgencyOptions[selectedIdx],
        orderId: order.id,
        organization: order.organization.name,
        timestamp: new Date().toISOString()
      });
    }

    // Redirect
    const toUrl = isDemo
      ? `/pharmacy?demo=true&phone=${phone}`
      : `/pharmacy?orderId=${order.id}&token=${token}`;
    navigate(toUrl);
  };

  const isMultiRx = flattenedFills.length > 1;

  return (
    <Box>
      <Helmet>
        <title>{t.readyBy}</title>
      </Helmet>

      <Nav />

      <Container pb={showFooter ? 32 : 8}>
        <VStack spacing={7} pt={5} align="span">
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.readyWhen}
            </Heading>
            <Text>{t.readyBySelected(isMultiRx)}</Text>
          </VStack>

          <VStack spacing={3} w="full">
            {t.urgencyOptions.map((option, i) => {
              const isDisabled = checkDisabled(option);
              return (
                <Button
                  key={option}
                  bgColor={selectedIdx === i ? 'gray.700' : undefined}
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
                  isActive={selectedIdx === i}
                  onClick={() => setSelectedIdx(i)}
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
            {t.selectPharmacy}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
