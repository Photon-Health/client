import { useContext } from 'react'
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

const prescriptions = [
  {
    id: 'sdfsafafssd',
    name: 'finasteride 1 MG Oral Tablet',
    quantity: 30,
    daysSupply: 30,
    refills: 5,
    substitutions: true,
    expires: '12/05/23',
    instructions: 'Lorem ipsum dolar sit met'
  },
  {
    id: 'sdfsafafsdfsaffssd',
    name: 'Flovent (Fluticasone 0.11 mg) Respiratory (inhalation) aerosol, metered',
    quantity: 30,
    daysSupply: 30,
    refills: 5,
    substitutions: true,
    expires: '12/05/23',
    instructions: 'Lorem ipsum dolar sit met'
  },
  {
    id: 'sdfsaasgfdgfdfafssd',
    name: 'Flovent (Fluticasone 0.11 mg) Respiratory (inhalation) aerosol, metered',
    quantity: 30,
    daysSupply: 30,
    refills: 5,
    substitutions: true,
    expires: '12/05/23',
    instructions: 'Lorem ipsum dolar sit met'
  },
  {
    id: 'sdfsagfdgfafssd',
    name: 'Flovent (Fluticasone 0.11 mg) Respiratory (inhalation) aerosol, metered',
    quantity: 30,
    daysSupply: 30,
    refills: 5,
    substitutions: true,
    expires: '12/05/23',
    instructions: 'Lorem ipsum dolar sit met'
  }
]

export const Review = () => {
  const order = useContext<Order>(OrderContext)

  const { organization } = order

  return (
    <Box>
      <Helmet>
        <title>{t.review.title}</title>
      </Helmet>

      <Nav header={organization.name} />

      <Container>
        <VStack spacing={6} align="start" pt={5} bgColor="rgb(247, 244, 244)" h="110vh">
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.review.heading}
            </Heading>
            <Text>{t.review.subheading}</Text>
          </VStack>
          <Box alignSelf="start">
            <Text display="inline" color="gray.500">
              {t.review.prescriber}
            </Text>
            <Text display="inline" ms={3}>
              Dr. Tim Porter
            </Text>
          </Box>

          <Accordion allowToggle defaultIndex={[0]}>
            {prescriptions.map(
              ({
                id,
                name,
                quantity,
                daysSupply,
                refills,
                substitutions,
                expires,
                instructions
              }) => {
                return (
                  <AccordionItem border="none" mb={3} key={id}>
                    <Card w="full" backgroundColor="white">
                      <CardBody p={0}>
                        <HStack>
                          <AccordionButton
                            p={5}
                            _expanded={{ bg: 'transparent' }}
                            _focus={{ bg: 'transparent' }}
                          >
                            <HStack me="auto">
                              <Box me={2}>
                                <FaPrescription size="1.3em" />
                              </Box>
                              <Text align="start">{name}</Text>
                            </HStack>
                            <Box>
                              <AccordionIcon />
                            </Box>
                          </AccordionButton>
                        </HStack>
                        <AccordionPanel mt={0} p={5} borderTop="1px" borderColor="gray.100">
                          <VStack align="span">
                            <HStack>
                              <HStack w="50%">
                                <Text color="gray.500">{t.review.quantity}</Text>
                                <Text>{quantity}</Text>
                              </HStack>
                              <HStack w="50%">
                                <Text color="gray.500">{t.review.daysSupply}</Text>
                                <Text>{daysSupply}</Text>
                              </HStack>
                            </HStack>
                            <HStack>
                              <HStack w="50%">
                                <Text color="gray.500">{t.review.refills}</Text>
                                <Text>{refills}</Text>
                              </HStack>
                              <HStack w="50%">
                                <Text color="gray.500">{t.review.substitutions}</Text>
                                <Text>{substitutions ? 'Yes' : 'No'}</Text>
                              </HStack>
                            </HStack>
                            <HStack w="full">
                              <Text color="gray.500">{t.review.expires}</Text>
                              <Text>{expires}</Text>
                            </HStack>
                            <HStack w="full">
                              <Text color="gray.500">{t.review.instructions}</Text>
                              <Text>{instructions}</Text>
                            </HStack>
                          </VStack>
                        </AccordionPanel>
                      </CardBody>
                    </Card>
                  </AccordionItem>
                )
              }
            )}
          </Accordion>
        </VStack>
      </Container>

      <FixedFooter show={true}>
        <Container as={VStack} w="full">
          <Button size="lg" w="full" variant="brand" as={RouterLink} to="/pharmacy">
            {t.review.cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  )
}
