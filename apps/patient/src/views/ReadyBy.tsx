import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  Icon,
  Radio,
  RadioGroup,
  Slide,
  Tag,
  Text,
  VStack
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';
import { datadogRum } from '@datadog/browser-rum';
import timezone from 'dayjs/plugin/timezone';
import { convertReadyByToUTCTimestamp } from '../utils/general';

dayjs.extend(timezone);

import { FixedFooter, Nav, PoweredBy } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { RxLightningBolt } from 'react-icons/rx';

const checkDisabled = (option: string): boolean => {
  const currentTime = dayjs();
  // If the option is within 30 minutes, disable it
  const timetoCheckDayJs = dayjs(option, 'h:mm a').subtract(30, 'minutes');
  return currentTime.isAfter(timetoCheckDayJs);
};

export const ReadyBy = () => {
  const { order, flattenedFills, setOrder } = useOrderContext();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const [readyBy, setReadyBy] = useState<string>(undefined);
  const [readyByDay, setReadyByDay] = useState<string>('Today');

  const handleSubmit = async () => {
    if (!readyBy) {
      console.error('No selected readyBy time.');
      return;
    }

    if (isDemo) {
      navigate(`/pharmacy?demo=true&phone=${phone}`);
      return;
    }

    const readyByTime = convertReadyByToUTCTimestamp(readyBy);

    // Track selection
    datadogRum.addAction('ready_by_selection', {
      readyBy: readyBy,
      readyByTime: readyByTime,
      orderId: order.id,
      organization: order.organization.name,
      timestamp: new Date().toISOString(),
      timezone: dayjs.tz.guess()
    });

    setOrder({
      ...order,
      readyBy,
      readyByTime
    });

    navigate(`/pharmacy?orderId=${order.id}&token=${token}`);
  };

  const isMultiRx = flattenedFills.length > 1;

  useEffect(() => {
    if (readyBy) {
      // Scroll to bottom to make sure selection isn't hidden by footer
      window.scrollTo({ top: document.getElementById('root').scrollHeight, behavior: 'smooth' });
    }
  }, [readyBy]);

  return (
    <Box>
      <Helmet>
        <title>{t.readyBy}</title>
      </Helmet>

      <Nav />

      <Container pb={4} bgColor="white">
        <VStack spacing={4} align="span">
          <Heading as="h3" size="lg">
            {t.readyWhen}
          </Heading>
          <Text>{t.readyBySelected(isMultiRx)}</Text>

          <HStack justify="space-evenly">
            {['Today', 'Tomorrow'].map((day) => (
              <Box key={day}>
                <Slide direction="left" in={readyByDay === day}>
                  <Button
                    w="full"
                    size="lg"
                    isActive={readyByDay === day}
                    _active={{
                      backgroundColor: 'brand.500',
                      color: 'white',
                      borderColor: 'brand.500'
                    }}
                    border="2px"
                    borderColor="gray.100"
                    backgroundColor="white"
                    onClick={() => setReadyByDay(day)}
                    borderRadius="xl"
                  >
                    {day}
                  </Button>
                </Slide>
              </Box>
            ))}
          </HStack>
        </VStack>
      </Container>

      <Container pb={readyBy ? 32 : 8}>
        <VStack spacing={7} pt={5} align="span">
          <RadioGroup onChange={setReadyBy} value={readyBy}>
            <VStack spacing={3} w="full">
              {t.readyByOptions.map((option) => {
                const isDisabled = checkDisabled(option.label);
                return (
                  <Card
                    key={option.label}
                    bgColor={isDisabled ? 'gray.300' : 'white'}
                    border={isDisabled ? 'gray.300' : '2px solid'}
                    borderColor={readyBy === option.label ? 'brand.500' : 'white'}
                    color={isDisabled ? 'gray.600' : 'base'}
                    onClick={() => !isDisabled && setReadyBy(option.label)}
                    m="auto"
                    w="full"
                    shadow={isDisabled ? 'none' : 'base'}
                    cursor={isDisabled ? 'not-allowed' : 'pointer'}
                  >
                    <CardBody p={3}>
                      <HStack align="start">
                        <Radio
                          mt={1}
                          value={option.label}
                          colorScheme="brand"
                          onClick={(e) => isDisabled && e.preventDefault()}
                          isDisabled={isDisabled}
                          cursor={isDisabled ? 'not-allowed' : 'pointer'}
                        />
                        <VStack spacing={1}>
                          <HStack alignSelf="start">
                            {option.icon ? <Icon as={RxLightningBolt} color="yellow.500" /> : null}
                            <Text fontWeight="medium">{option.label}</Text>
                          </HStack>
                          {option.description ? (
                            option.badge ? (
                              <Tag
                                colorScheme={option.badgeColor}
                                variant="subtle"
                                borderRadius="full"
                              >
                                {option.description}
                              </Tag>
                            ) : (
                              <Text color="gray.500" fontSize="sm">
                                {option.description}
                              </Text>
                            )
                          ) : null}
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>
          </RadioGroup>
        </VStack>
      </Container>

      <FixedFooter show={!!readyBy}>
        <Container as={VStack} w="full">
          <Button size="lg" w="full" variant="brand" onClick={handleSubmit}>
            {t.next}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
