import { useContext, useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  Text,
  VStack
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaPrescription } from 'react-icons/fa'
import { Helmet } from 'react-helmet'

import { Order } from '../utils/models'
import { FixedFooter } from '../components/FixedFooter'
import { Nav } from '../components/Nav'
import { PoweredBy } from '../components/PoweredBy'
import t from '../utils/text.json'
import { OrderContext } from './Main'
import { prescriptions } from '../utils/demoPrescriptions'

export const Windows = () => {
  const order = useContext<Order>(OrderContext)

  const { organization } = order

  const [selected, setSelected] = useState(undefined)

  const things = ['As soon as possible', 'By today', 'By tomorrow', 'In the next few days']

  return (
    <Box>
      <Helmet>
        <title>{t.review.title}</title>
      </Helmet>

      <Nav header={organization.name} orgId={organization.id} />

      <Container>
        <VStack spacing={6} align="start" pt={5}>
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.windows.heading}
            </Heading>
            <Text>{t.windows.subheading}</Text>
          </VStack>
        </VStack>
        <VStack spacing={6} align="start" pt={5}>
          <VStack spacing={3} align="start">
            {things.map((text, i) => (
              <Button
                bgColor={selected === i ? 'gray.700' : undefined}
                _active={{
                  bgColor: 'gray.700',
                  textColor: 'white'
                }}
                isActive={selected === i}
                onClick={() => setSelected(i)}
              >
                {text}
              </Button>
            ))}
          </VStack>
        </VStack>
      </Container>

      <FixedFooter show={typeof selected !== 'undefined'}>
        <Container as={VStack} w="full">
          <Button size="lg" w="full" variant="brand" as={RouterLink} to="/pharmacy">
            {t.windows.cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  )
}
