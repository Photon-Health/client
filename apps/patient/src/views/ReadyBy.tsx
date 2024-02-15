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

  const [selectedIdx, setSelectedIdx] = useState(null);
  const showFooter = selectedIdx !== null;

  const handleSubmit = async () => {
    if (!selectedIdx) {
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
    const selectedTime = t.readyByOptions[selectedIdx].label;
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
            {t.readyByOptions.map((option, i) => {
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
