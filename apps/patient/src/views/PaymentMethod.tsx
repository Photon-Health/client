import { useState } from 'react';
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
  Fade,
  Text,
  VStack
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

import { FixedFooter, PoweredBy } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from './Main';
import { FiCreditCard } from 'react-icons/fi';
import { PiMoneyWavy } from 'react-icons/pi';
import { datadogRum } from '@datadog/browser-rum';

export const PaymentMethod = () => {
  const { order, setPaymentMethod } = useOrderContext();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isDemo = searchParams.get('demo');
  const phone = searchParams.get('phone');

  const [selectedMethod, setSelectedMethod] = useState<string | undefined>(undefined);

  const handleSubmit = async () => {
    if (isDemo) {
      navigate(`/pharmacy?demo=true&phone=${phone}`);
      return;
    }

    if (!order) {
      console.error('Tried to submit without an order');
      return;
    }
    if (!selectedMethod) {
      console.error('No selected payment method.');
      return;
    }

    // Track selection
    datadogRum.addAction('payment_method_selection', {
      paymentMethod: selectedMethod,
      orderId: order.id,
      organization: order.organization.name,
      timestamp: new Date().toISOString()
    });

    setPaymentMethod(selectedMethod);

    navigate(`/pharmacy?orderId=${order?.id}&token=${token}`);
  };

  return (
    <Box>
      <Helmet>
        <title>{t.selectPaymentMethod}</title>
      </Helmet>

      <Box bgColor="white">
        <Container>
          <VStack spacing={4} align="span" py={4}>
            <Heading as="h3" size="lg">
              {t.whatPaymentMethod}
            </Heading>
            <Text>{t.payWithoutInsurance}</Text>
          </VStack>
        </Container>
      </Box>

      <Box pt={5} shadow="inner">
        <Container pb={selectedMethod ? 32 : 8}>
          <RadioGroup value={selectedMethod}>
            <VStack spacing={3} w="full" align="stretch">
              {t.paymentMethodOptions.map((option) => (
                <Fade key={option.label} in={true}>
                  <Card
                    bgColor="white"
                    border="2px solid"
                    borderColor={selectedMethod === option.label ? 'brand.500' : 'white'}
                    borderRadius="lg"
                    color="base"
                    onClick={() => {
                      setSelectedMethod(option.label);
                    }}
                    m="auto"
                    w="full"
                    shadow="base"
                    cursor="pointer"
                  >
                    <CardBody p={3}>
                      <HStack align="start">
                        <Radio mt={1} value={option.label} colorScheme="brand" cursor={'pointer'} />
                        <VStack spacing={1}>
                          <HStack alignSelf="start">
                            <Icon
                              as={option.label === 'Insurance Copay' ? FiCreditCard : PiMoneyWavy}
                              color={
                                option.label === 'Insurance Copay' ? 'yellow.500' : 'green.500'
                              }
                              fontSize="20px"
                            />
                            <Text fontWeight="bold">{option.label}</Text>
                          </HStack>
                          <Text>{option.description}</Text>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                </Fade>
              ))}
            </VStack>
          </RadioGroup>
        </Container>
      </Box>

      <FixedFooter show={!!selectedMethod}>
        <Container as={VStack} w="full">
          <Button size="lg" borderRadius="lg" w="full" variant="brand" onClick={handleSubmit}>
            {t.next}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  );
};
