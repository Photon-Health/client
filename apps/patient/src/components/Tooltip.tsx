import { ComponentPropsWithoutRef, ReactNode, useEffect, useRef, useState } from 'react';
import { Tooltip as ChakraTooltip, TooltipProps as ChakraTooltipProps } from '@chakra-ui/react';

interface TooltipProps extends Omit<ChakraTooltipProps, 'children'> {
  wrapperProps?: ComponentPropsWithoutRef<'span'>;
  children: ReactNode;
}

/**
 * Wrapper around Chakra UI Tooltip that adds mobile tap-to-toggle and outside-tap-to-close.
 */
export const Tooltip = ({ children, wrapperProps, ...tooltipProps }: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      if (e.target instanceof Node && !wrapperRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [isOpen]);

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
        ref={wrapperRef}
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
