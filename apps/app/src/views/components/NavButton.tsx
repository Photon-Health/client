import { As, Button, ButtonProps, HStack, Icon, Text } from '@chakra-ui/react'

import { Link as RouterLink, useMatch, useResolvedPath } from 'react-router-dom'

interface NavButtonProps extends ButtonProps {
  icon: As
  label: string
  link: string
}

export const NavButton = (props: NavButtonProps) => {
  const { icon, label, link, ...buttonProps } = props

  const resolved = useResolvedPath(link)
  const isActive = useMatch({ path: resolved.pathname, end: true })

  return (
    <Button
      as={RouterLink}
      to={link}
      variant="ghost"
      justifyContent="start"
      aria-current={isActive ? 'page' : undefined}
      {...buttonProps}
    >
      <HStack spacing="3">
        <Icon as={icon} boxSize="5" color="subtle" />
        {label && <Text>{label}</Text>}
      </HStack>
    </Button>
  )
}
