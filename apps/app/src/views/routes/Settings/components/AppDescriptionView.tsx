import { Box, Stack, Text } from '@chakra-ui/react'

interface AppDescriptionViewProps {
  appType: string
}

export const AppDescriptionView = (props: AppDescriptionViewProps) => {
  const { appType } = props

  let type
  let description
  switch (appType) {
    case 'non_interactive':
      type = 'Machine to Machine Application'
      description = `These credentials are for CLIs, daemons or services running on your backend.
                    e.g.: Shell script`
      break
    case 'native':
      type = 'Native Application'
      description = `These credentials are for your mobile, desktop, CLI and smart device apps running natively.
                    e.g.: iOS, Electron, Apple TV apps`
      break
    case 'spa':
      type = 'Single Page Application'
      description = `These credentials are for your JavaScript front-end app that uses an API.
                    e.g.: Angular, React, Vue`
      break
    case 'regular_web':
      type = 'Regular Web Application'
      description = `These credentials are for a traditional web app using redirects.
                    e.g.: Node.js Express, ASP.NET, Java, PHP`
      break
    default:
      type = ''
      description = ''
  }

  return (
    <Box flex="2">
      <Stack>
        <Text key={type} fontSize="l" fontWeight="medium">
          {type}
        </Text>
        <Text color="muted" fontSize="md">
          {description}
        </Text>
      </Stack>
    </Box>
  )
}
