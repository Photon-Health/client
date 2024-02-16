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
  Tag,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { selectReadyBy } from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';
import { datadogRum } from '@datadog/browser-rum';
import timezone from 'dayjs/plugin/timezone';
import * as TOAST_CONFIG from '../configs/toast';

dayjs.extend(timezone);

import { FixedFooter, Nav, PoweredBy } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { RxLightningBolt } from 'react-icons/rx';
import { FiCheck } from 'react-icons/fi';

const checkDisabled = (option: string): boolean => {
  const currentTime = dayjs();
  const timetoCheckDayJs = dayjs(option, 'h:mm a');
  return currentTime.isAfter(timetoCheckDayJs);
};

export const ReadyBy = () => {
  const { order, flattenedFills } = useOrderContext();

  const navigate = useNavigate();

  const toast = useToast();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState<boolean>(false);

  const [selectedTime, setSelectedTime] = useState('');

  const handleSubmit = async () => {
    if (!selectedTime) {
      console.error('No selected readyBy time.');
      return;
    }

    setSubmitting(true);

    if (isDemo) {
      setTimeout(() => {
        setSuccessfullySubmitted(true);
        setTimeout(() => {
          navigate(`/pharmacy?demo=true&phone=${phone}`);
        }, 1000);
        setSubmitting(false);
      }, 1000);

      return;
    }

    // Track selection
    datadogRum.addAction('ready_by_selection', {
      value: selectedTime,
      orderId: order.id,
      organization: order.organization.name,
      timestamp: new Date().toISOString(),
      timezone: dayjs.tz.guess()
    });

    try {
      const result = await selectReadyBy(order.id, selectedTime);

      setTimeout(() => {
        if (result) {
          setSuccessfullySubmitted(true);
          setTimeout(() => {
            navigate(`/pharmacy?orderId=${order.id}&token=${token}`);
          }, 1000);
        } else {
          toast({
            title: 'Unable to select ready by time',
            description: 'Please refresh and try again',
            ...TOAST_CONFIG.ERROR
          });
        }
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      toast({
        title: 'Unable to select ready by time',
        description: 'Please refresh and try again',
        ...TOAST_CONFIG.ERROR
      });

      setSubmitting(false);

      console.error(JSON.stringify(error, undefined, 2));
    }
  };

  const isMultiRx = flattenedFills.length > 1;

  useEffect(() => {
    if (selectedTime) {
      // Scroll to bottom to make sure selection isn't hidden by footer
      window.scrollTo({ top: document.getElementById('root').scrollHeight, behavior: 'smooth' });
    }
  }, [selectedTime]);

  return (
    <Box>
      <Helmet>
        <title>{t.readyBy}</title>
      </Helmet>

      <Nav />

      <Container pb={selectedTime ? 32 : 8}>
        <VStack spacing={7} pt={5} align="span">
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.readyWhen}
            </Heading>
            <Text>{t.readyBySelected(isMultiRx)}</Text>
          </VStack>

          <RadioGroup onChange={setSelectedTime} value={selectedTime}>
            <VStack spacing={3} w="full">
              {t.readyByOptions.map((option) => {
                const isDisabled = checkDisabled(option.label);
                return (
                  <Card
                    key={option.label}
                    bgColor={isDisabled ? 'gray.300' : 'white'}
                    border={isDisabled ? 'gray.300' : '2px solid'}
                    borderColor={selectedTime === option.label ? 'brand.500' : 'white'}
                    color={isDisabled ? 'gray.600' : 'base'}
                    onClick={() => !isDisabled && setSelectedTime(option.label)}
                    m="auto"
                    w="full"
                    shadow={isDisabled ? 'none' : 'base'}
                    cursor={isDisabled ? 'not-allowed' : 'pointer'}
                  >
                    <CardBody p={3}>
                      <HStack align="start">
                        <Radio mt={1} value={option.label} colorScheme="brand" />
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

      <FixedFooter show={!!selectedTime}>
        <Container as={VStack} w="full">
          <Button
            size="lg"
            w="full"
            variant={successfullySubmitted ? undefined : 'brand'}
            colorScheme={successfullySubmitted ? 'green' : undefined}
            leftIcon={successfullySubmitted ? <FiCheck /> : undefined}
            onClick={!successfullySubmitted ? handleSubmit : undefined}
            isLoading={submitting}
          >
            {successfullySubmitted ? t.thankYou : t.selectPharmacy}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
