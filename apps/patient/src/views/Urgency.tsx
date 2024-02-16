import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';
import { datadogRum } from '@datadog/browser-rum';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

import { FixedFooter, Nav, PoweredBy } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { RxLightningBolt } from 'react-icons/rx';

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

  const [selectedIdx, setSelectedIdx] = useState(null);
  const showFooter = selectedIdx !== null;

  const handleCtaClick = () => {
    if (!isDemo) {
      // Track selection
      datadogRum.addAction('urgency_selection', {
        value: t.urgencyOptions[selectedIdx].label,
        orderId: order.id,
        organization: order.organization.name,
        timestamp: new Date().toISOString(),
        timezone: dayjs.tz.guess()
      });
    }

    // Redirect
    const toUrl = isDemo
      ? `/pharmacy?demo=true&phone=${phone}`
      : `/pharmacy?orderId=${order.id}&token=${token}`;
    navigate(toUrl);
  };

  const isMultiRx = flattenedFills.length > 1;

  useEffect(() => {
    if (selectedIdx) {
      // Scroll to bottom to make sure selection isn't hidden by footer
      window.scrollTo({ top: document.getElementById('root').scrollHeight, behavior: 'smooth' });
    }
  }, [selectedIdx]);

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
              const isDisabled = checkDisabled(option.label);
              return (
                <Card
                  key={option.label}
                  bgColor={isDisabled ? 'gray.300' : 'white'}
                  border={isDisabled ? 'gray.300' : '2px solid'}
                  borderColor={selectedIdx === i ? 'brand.500' : 'white'}
                  color={isDisabled ? 'gray.600' : 'base'}
                  onClick={() => !isDisabled && setSelectedIdx(i)}
                  m="auto"
                  w="full"
                  shadow={isDisabled ? 'none' : 'base'}
                  cursor={isDisabled ? 'not-allowed' : 'pointer'}
                >
                  <CardBody p={3} m="auto">
                    {option.description ? (
                      <VStack spacing={1}>
                        <HStack>
                          {option.icon ? <RxLightningBolt /> : null}
                          <Text fontWeight="medium">{option.label}</Text>
                        </HStack>
                        <Text color="gray.500">{option.description}</Text>
                      </VStack>
                    ) : (
                      <Text fontWeight="medium">{option.label}</Text>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
        </VStack>
      </Container>

      <FixedFooter show={showFooter}>
        <Container as={VStack} w="full">
          <Button size="lg" w="full" variant="brand" onClick={handleCtaClick}>
            {t.selectAPharmacy}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
