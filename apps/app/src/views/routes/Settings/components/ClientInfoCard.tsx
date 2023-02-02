import { Box, Stack } from '@chakra-ui/react'

import { AppDescriptionView } from './AppDescriptionView'
import { AppNameView } from './AppNameView'
import { ClientIdView } from './ClientIdView'
import { ClientSecretView } from './ClientSecretView'
import { RotateSecret } from './RotateSecret'

interface ClientInfoCardProps {
  client: any
}

export const ClientInfoCard = (props: ClientInfoCardProps) => {
  const { client } = props

  return (
    <Box as="form" {...props}>
      <Stack spacing={6}>
        <AppDescriptionView appType={client?.appType} />
        <AppNameView name={client?.name} />
        <ClientIdView clientId={client?.id} />
        {client?.appType !== 'spa' && (
          <>
            <ClientSecretView clientSecret={client?.secret} />
            <RotateSecret clientId={client?.id} />
          </>
        )}
      </Stack>
    </Box>
  )
}
