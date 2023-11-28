import { As, Button, ButtonProps, HStack, Icon, Text, useTheme } from '@chakra-ui/react';
import { Link as RouterLink, useMatch, useResolvedPath } from 'react-router-dom';

interface NavButtonProps extends ButtonProps {
  icon: As;
  label: string;
  link: string;
}

export const NavButton = (props: NavButtonProps) => {
  const { icon, label, link, ...buttonProps } = props;
  const theme = useTheme();

  const resolved = useResolvedPath(link);
  const isActive = useMatch({ path: resolved.pathname, end: true });
  const iconSlateShade = isActive ? '400' : '500';

  return (
    <Button
      as={RouterLink}
      to={link}
      variant="ghost"
      justifyContent="start"
      aria-current={isActive ? 'page' : undefined}
      bg={isActive ? theme.colors.slate['900'] : undefined}
      sx={{
        '&[aria-current=page]': { backgroundColor: theme.colors.slate['900'] },
        '&:hover': { backgroundColor: theme.colors.slate['800'] }
      }}
      {...buttonProps}
    >
      <HStack spacing="3">
        <Icon as={icon} boxSize="5" color={!label ? 'white' : theme.colors.slate[iconSlateShade]} />
        {label && <Text color="white">{label}</Text>}
      </HStack>
    </Button>
  );
};
