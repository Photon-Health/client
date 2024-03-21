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
  SlideFade,
  Tag,
  Text,
  VStack
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';
import { datadogRum } from '@datadog/browser-rum';
import timezone from 'dayjs/plugin/timezone';
import { capitalize, convertReadyByToUTCTimestamp } from '../utils/general';

dayjs.extend(timezone);

import { FixedFooter, PoweredBy } from '../components';
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

  const [readyBy, setReadyBy] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string | undefined>('today');

  const handleSubmit = async () => {
    const [selectedTime, selectedDay] = readyBy.split(' ');

    if (!selectedTime || !selectedDay) {
      console.error('No selected readyBy time/day.');
      return;
    }

    if (isDemo) {
      navigate(`/pharmacy?demo=true&phone=${phone}`);
      return;
    }

    const readyByTime = convertReadyByToUTCTimestamp(selectedTime, selectedDay);

    // Track selection
    datadogRum.addAction('ready_by_selection', {
      readyBy: selectedTime,
      readyByDay: selectedDay,
      readyByTime: readyByTime,
      orderId: order.id,
      organization: order.organization.name,
      timestamp: new Date().toISOString(),
      timezone: dayjs.tz.guess()
    });

    setOrder({
      ...order,
      readyBy: selectedTime,
      readyByDay: selectedDay,
      readyByTime
    });

    navigate(`/pharmacy?orderId=${order.id}&token=${token}`);
  };

  const isMultiRx = flattenedFills.length > 1;

  useEffect(() => {
    if (readyBy) {
      // Scroll to bottom to make sure selection isn't hidden by footer
      // window.scrollTo({ top: document.getElementById('root').scrollHeight, behavior: 'smooth' });
    }
  }, [readyBy]);

  return (
    <Box>
      <Helmet>
        <title>{t.readyBy}</title>
      </Helmet>

      <Box bgColor="white">
        <Container>
          <VStack spacing={4} align="span" pt={4}>
            <Heading as="h3" size="lg">
              {t.readyWhen}
            </Heading>
            <Text>{t.readyBySelected(isMultiRx)}</Text>
          </VStack>
        </Container>
      </Box>

      <Box bgColor="white" style={{ position: 'sticky', top: 90, zIndex: 50000 }}>
        <Container p={4}>
          <HStack>
            {['today', 'tomorrow'].map((day) => (
              <Button
                key={day}
                type="button"
                w="full"
                size="lg"
                isActive={day === activeTab}
                _active={{
                  backgroundColor: 'brand.500',
                  color: 'white',
                  borderColor: 'brand.500'
                }}
                border="2px"
                borderColor="gray.100"
                backgroundColor="white"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(day);
                  // setReadyBy(undefined);
                }}
                borderRadius="xl"
              >
                {capitalize(day)}
              </Button>
            ))}
          </HStack>
        </Container>
      </Box>

      <Box pt={5} shadow="inner">
        <Container pb={readyBy ? 32 : 8}>
          <RadioGroup value={readyBy}>
            <VStack spacing={3} w="full" align="stretch">
              {t.readyByOptions[activeTab].map((option) => {
                const isDisabled = activeTab === 'today' ? checkDisabled(option.label) : false;

                return (
                  <SlideFade
                    key={activeTab + ' ' + option.label}
                    offsetX={'-100px'}
                    offsetY="0px"
                    in={true}
                  >
                    <Card
                      bgColor={isDisabled ? 'gray.300' : 'white'}
                      border={isDisabled ? 'gray.300' : '2px solid'}
                      borderColor={
                        readyBy === activeTab + ' ' + option.label ? 'brand.500' : 'white'
                      }
                      color={isDisabled ? 'gray.600' : 'base'}
                      onClick={() => {
                        if (!isDisabled) {
                          setReadyBy(activeTab + ' ' + option.label);
                        }
                      }}
                      m="auto"
                      w="full"
                      shadow={isDisabled ? 'none' : 'base'}
                      cursor={isDisabled ? 'not-allowed' : 'pointer'}
                    >
                      <CardBody p={3}>
                        <HStack align="start">
                          <Radio
                            mt={1}
                            value={activeTab + ' ' + option.label}
                            colorScheme="brand"
                            onClick={(e) => isDisabled && e.preventDefault()}
                            isDisabled={isDisabled}
                            cursor={isDisabled ? 'not-allowed' : 'pointer'}
                          />
                          <VStack spacing={1}>
                            <HStack alignSelf="start">
                              {option.icon ? (
                                <Icon as={RxLightningBolt} color="yellow.500" />
                              ) : null}
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
                  </SlideFade>
                );
              })}
            </VStack>
          </RadioGroup>
        </Container>
      </Box>

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
