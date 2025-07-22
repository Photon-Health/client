import { Button, ButtonProps, HStack, Icon, Text, useTheme } from '@chakra-ui/react';
import { Link as RouterLink, useMatch, useResolvedPath } from 'react-router-dom';
import { IconType } from 'react-icons/lib';

interface NavButtonProps extends ButtonProps {
  icon: IconType;
  label: string;
  link: string;
  bgIsWhite?: boolean;
  iconColor?: string;
}

export const NavButton = (props: NavButtonProps) => {
  const { icon, label, link, bgIsWhite, iconColor, ...buttonProps } = props;
  const theme = useTheme();

  const resolved = useResolvedPath(link);
  const isActive = useMatch({ path: resolved.pathname, end: true });
  const iconSlateShade = isActive ? '200' : '300';

  const bgColor = bgIsWhite ? theme.colors.navy['200'] : theme.colors.navy['900'];
  const bgHoverColor = bgIsWhite ? theme.colors.navy['100'] : theme.colors.navy['700'];
  const textColor = bgIsWhite ? theme.colors.navy['900'] : 'white';

  return (
    <Button
      as={RouterLink}
      to={link}
      variant="ghost"
      justifyContent="start"
      aria-current={isActive ? 'page' : undefined}
      bg={isActive ? bgColor : undefined}
      color={textColor}
      sx={{
        '&[aria-current=page]': {
          backgroundColor: bgColor
        },
        '&:hover': { backgroundColor: bgHoverColor }
      }}
      {...buttonProps}
    >
      <HStack spacing="3">
        <Icon
          as={icon}
          boxSize="5"
          color={iconColor ?? (!label ? 'white' : theme.colors.navy[iconSlateShade])}
        />
        {label && <Text>{label}</Text>}
      </HStack>
    </Button>
  );
};
