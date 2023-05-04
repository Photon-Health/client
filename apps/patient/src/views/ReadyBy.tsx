import { useContext, useState } from 'react'
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import dayjs from 'dayjs'

import { Order } from '../utils/models'
import { FixedFooter } from '../components/FixedFooter'
import { Nav } from '../components/Nav'
import { PoweredBy } from '../components/PoweredBy'
import t from '../utils/text.json'
import { OrderContext } from './Main'

export const ReadyBy = () => {
  const order = useContext<Order>(OrderContext)

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const navigate = useNavigate()

  const { organization } = order

  const [selected, setSelected] = useState(undefined)

  const handleCtaClick = () => {
    navigate(`/pharmacy?orderId=${order.id}&token=${token}`)
  }

  const checkAfter = (checkTime: string) => {
    const currentTime = dayjs()
    const checkTimeDayjs = dayjs(checkTime, 'h:mm a')
    return currentTime.isAfter(checkTimeDayjs)
  }

  return (
    <Box>
      <Helmet>
        <title>{t.readyBy.title}</title>
      </Helmet>

      <Nav header={organization.name} orgId={organization.id} />

      <Container>
        <VStack spacing={7} pt={5} align="span">
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.readyBy.heading}
            </Heading>
            <Text>{t.readyBy.subheading}</Text>
          </VStack>

          <VStack spacing={3} w="full">
            {t.readyBy.options.map((text, i) => {
              const isDisabled = i !== (0 | 5 | 6) && checkAfter(text)
              return (
                <Button
                  key={text}
                  bgColor={selected === i ? 'gray.700' : undefined}
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
                  isActive={selected === i}
                  onClick={() => setSelected(i)}
                  isDisabled={isDisabled}
                >
                  {text}
                </Button>
              )
            })}
          </VStack>
        </VStack>
      </Container>

      <FixedFooter show={typeof selected !== 'undefined'}>
        <Container as={VStack} w="full">
          <Button size="lg" w="full" variant="brand" onClick={handleCtaClick}>
            {t.readyBy.cta}
          </Button>
          <PoweredBy />
        </Container>
      </FixedFooter>
    </Box>
  )
}
