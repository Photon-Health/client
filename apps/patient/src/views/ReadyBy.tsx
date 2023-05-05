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

  const currentTimeIsAfterOption = (option: string): boolean => {
    const currentTime = dayjs()
    const afterHoursOption = t.readyBy.options[5]
    const afterHoursStarts = '6:00 pm'
    const timetoCheck = option === afterHoursOption ? afterHoursStarts : option
    const timetoCheckDayjs = dayjs(timetoCheck, 'h:mm a')
    return currentTime.isAfter(timetoCheckDayjs)
  }

  const showFooter = typeof selected !== 'undefined'

  return (
    <Box>
      <Helmet>
        <title>{t.readyBy.title}</title>
      </Helmet>

      <Nav header={organization.name} orgId={organization.id} />

      <Container pb={showFooter ? 32 : 8}>
        <VStack spacing={7} pt={5} align="span">
          <VStack spacing={2} align="start">
            <Heading as="h3" size="lg">
              {t.readyBy.heading}
            </Heading>
            <Text>{t.readyBy.subheading}</Text>
          </VStack>

          <VStack spacing={3} w="full">
            {t.readyBy.options.map((option, i) => {
              const isDisabled = i !== (0 | 5 | 6) && currentTimeIsAfterOption(option)
              return (
                <Button
                  key={option}
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
                  {option}
                </Button>
              )
            })}
          </VStack>
        </VStack>
      </Container>

      <FixedFooter show={showFooter}>
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
