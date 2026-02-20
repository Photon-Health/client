import { ComponentPropsWithoutRef, ReactNode, useState } from 'react';
import { Tooltip as ChakraTooltip, TooltipProps as ChakraTooltipProps } from '@chakra-ui/react';

interface InfoTooltipProps extends Omit<ChakraTooltipProps, 'children'> {
  wrapperProps?: ComponentPropsWithoutRef<'span'>;
  children: ReactNode;
}

/**
 * Wrapper component around Chakra UI Tooltip
 * which doesn't support a good mobile experience out-of-the-box
 */
export const Tooltip = ({ children, wrapperProps, ...tooltipProps }: InfoTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChakraTooltip
      isOpen={isOpen}
      hasArrow={true}
      bg="white"
      color="gray.800"
      fontWeight="normal"
      boxShadow="lg"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      p={3}
      sx={{
        '--popper-arrow-shadow-color': 'colors.gray.200'
      }}
      {...tooltipProps}
    >
      <span
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') {
            // If the pointerType is mouse (desktop),
            // isOpen is handled by pointerEnter and pointerLeave
            return;
          }
          setIsOpen((prev) => !prev);
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') {
            setIsOpen(true);
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') {
            setIsOpen(false);
          }
        }}
        {...wrapperProps}
      >
        {children}
      </span>
    </ChakraTooltip>
  );
};
