import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Fade,
  Heading,
  HStack,
  Icon,
  Radio,
  RadioGroup,
  Tag,
  Text,
  VStack
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';
import { datadogRum } from '@datadog/browser-rum';
import timezone from 'dayjs/plugin/timezone';
import queryString from 'query-string';
import { convertReadyByToUTCTimestamp } from '../utils/general';
import { FixedFooter, PoweredBy } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { RxLightningBolt } from 'react-icons/rx';
import { FiCheck } from 'react-icons/fi';
import { capitalize } from '../utils/formatters';
import { usePageAnalytics } from '../hooks/usePageAnalytics';

dayjs.extend(timezone);

const checkDisabled = (option: string): boolean => {
  const currentTime = dayjs();
  // If the option is within 30 minutes, disable it
  const timetoCheckDayJs = dayjs(option, 'h:mm a').subtract(30, 'minutes');
  return currentTime.isAfter(timetoCheckDayJs);
};

export const ReadyBy = () => {
  const { order, flattenedFills, setOrder, enablePrice } = useOrderContext();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<keyof (typeof t)['readyByOptions']>('Today');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);

  const isMultiRx = flattenedFills.length > 1;

  usePageAnalytics({ pageName: "Patient's Ready By Time" });

  const handleSubmit = async () => {
    if (isDemo) {
      navigate(`/pharmacy?demo=true&phone=${phone}`);
      return;
    }

    if (!order) {
      console.error('Tried to submit without an order');
      return;
    }
    if (!selectedTime || !selectedDay) {
      console.error('No selected readyBy time/day.');
      return;
    }
    if (!order.pharmacy?.id) {
      console.error('No pharmacy selected.');
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

    setSubmitting(true);

    // Submit the pharmacy to the order with the ready-by time
    try {
      const { setOrderPharmacy } = await import('../api');
      const result = await setOrderPharmacy(
        order.id,
        order.pharmacy.id,
        selectedTime,
        selectedDay,
        readyByTime,
        enablePrice
      );

      if (result) {
        setOrder({
          ...order,
          readyBy: selectedTime,
          readyByDay: selectedDay,
          readyByTime
        });

        setSuccessfullySubmitted(true);
        setTimeout(() => {
          // Go to status page
          const query = queryString.stringify({ orderId: order?.id, token });
          navigate(`/status?${query}`);
        }, 1000);
      } else {
        // Handle error
        console.error('Failed to set pharmacy on order');
      }
    } catch (error) {
      console.error('Error setting pharmacy on order:', error);
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (selectedTime) {
      // Scroll to bottom to make sure selection isn't hidden by footer
      window.scrollTo({ top: document.getElementById('root')?.scrollHeight, behavior: 'smooth' });
    }
  }, [selectedTime]);

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

      <Box
        bgColor="white"
        style={{
          position: 'sticky',
          top: process.env.REACT_APP_ENV_NAME === 'photon' ? 55 : 90,
          // z-index set here to sit above ready by options but still below nav so shadow looks good
          zIndex: 1
        }}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Container p={4}>
          <HStack>
            {(['Today', 'Tomorrow'] as const).map((day) => (
              <Button
                key={day}
                type="button"
                w="full"
                size="lg"
                isActive={day === activeTab}
                variant={day === activeTab ? 'brand' : undefined}
                _active={{
                  backgroundColor: 'brand.500',
                  borderColor: 'brand.500'
                }}
                border="2px"
                borderColor="gray.100"
                backgroundColor="white"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedTime(undefined);
                  setSelectedDay(undefined);
                  setActiveTab(day);
                }}
                borderRadius="xl"
              >
                {capitalize(day)}
              </Button>
            ))}
          </HStack>
        </Container>
      </Box>

      <Box pt={5}>
        <Container pb={selectedTime ? 32 : 8}>
          <RadioGroup value={`${selectedDay}-${selectedTime}`}>
            <VStack spacing={3} w="full" align="stretch">
              {t.readyByOptions[activeTab].map((option) => {
                const isDisabled = activeTab === 'Today' ? checkDisabled(option.label) : false;
                const isSelected = selectedTime === option.label && selectedDay === activeTab;

                return (
                  <Fade key={activeTab + '-' + option.label} in={true}>
                    <Card
                      bgColor={isDisabled ? 'gray.300' : 'white'}
                      border={isDisabled ? 'gray.300' : '2px solid'}
                      borderWidth={isSelected ? '2px' : '1px'}
                      borderColor={isSelected ? 'brand.500' : 'gray.200'}
                      borderRadius="lg"
                      color={isDisabled ? 'gray.600' : 'base'}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedTime(option.label);
                          setSelectedDay(activeTab);
                        }
                      }}
                      m="auto"
                      w="full"
                      shadow="none"
                      cursor={isDisabled ? 'not-allowed' : 'pointer'}
                    >
                      <CardBody p={3}>
                        <HStack align="start">
                          <Radio
                            mt={1}
                            value={`${activeTab}-${option.label}`}
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
                  </Fade>
                );
              })}
            </VStack>
          </RadioGroup>
        </Container>
      </Box>

      <FixedFooter show={!!selectedTime}>
        <Container as={VStack} w="full">
          <Button
            size="lg"
            borderRadius="lg"
            w="full"
            variant={successfullySubmitted ? undefined : 'brand'}
            colorScheme={successfullySubmitted ? 'green' : undefined}
            leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
            onClick={!successfullySubmitted ? handleSubmit : undefined}
            isLoading={submitting}
            disabled={selectedTime == null}
            isDisabled={selectedTime == null}
          >
            {successfullySubmitted ? t.thankYou : t.next}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
