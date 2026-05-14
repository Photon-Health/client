// A minimal Chakra-styled dialog without the Chakra `Modal` machinery
// (no Portal, no react-focus-lock, no react-remove-scroll). Use this when
// the dialog contains a Solid web component (`<photon-*>`); the libraries
// Modal pulls in interfere with shadow-DOM event/scroll handling.
import { Box, BoxProps, Flex } from '@chakra-ui/react';
import { createContext, ReactNode, useContext, useEffect, useId, useMemo, useRef } from 'react';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const SIZE_MAX_W: Record<DialogSize, string> = {
  sm: '24rem',
  md: '28rem',
  lg: '32rem',
  xl: '36rem',
  '2xl': '42rem',
  '3xl': '48rem'
};

interface DialogContextValue {
  onClose: () => void;
  labelId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
  const ctx = useContext(DialogContext);
  if (!ctx)
    throw new Error('Dialog.Header / Dialog.Body / Dialog.Footer must be used inside <Dialog>');
  return ctx;
};

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  size?: DialogSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  children: ReactNode;
}

const DialogRoot = ({
  isOpen,
  onClose,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  children
}: DialogProps) => {
  const labelId = useId();
  const value = useMemo(() => ({ onClose, labelId }), [onClose, labelId]);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  // Only close on overlay click if the gesture both started and ended on the
  // overlay itself — otherwise dragging text from inside the dialog and
  // releasing outside would close it.
  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    mouseDownTargetRef.current = e.target;
  };
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!closeOnOverlayClick) return;
    if (mouseDownTargetRef.current === e.currentTarget) onClose();
  };

  return (
    <DialogContext.Provider value={value}>
      <Flex
        position="fixed"
        inset={0}
        bg="blackAlpha.600"
        align="center"
        justify="center"
        zIndex="modal"
        onMouseDown={handleOverlayMouseDown}
        onClick={handleOverlayClick}
      >
        <Box
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          bg="white"
          borderRadius="md"
          shadow="lg"
          maxW={SIZE_MAX_W[size]}
          w="90vw"
          maxH="90vh"
          display="flex"
          flexDirection="column"
        >
          {children}
        </Box>
      </Flex>
    </DialogContext.Provider>
  );
};

const DialogHeader = ({ children }: { children: ReactNode }) => {
  const { labelId } = useDialogContext();
  return (
    <Box id={labelId} px={6} py={4} borderBottomWidth="1px" fontSize="lg" fontWeight="semibold">
      {children}
    </Box>
  );
};

const DialogBody = ({ children, ...boxProps }: { children: ReactNode } & BoxProps) => (
  <Box flex="1" overflowY="scroll" px={6} py={4} {...boxProps}>
    {children}
  </Box>
);

const DialogFooter = ({ children }: { children: ReactNode }) => (
  <Flex px={6} py={4} borderTopWidth="1px" justify="flex-end" gap={2}>
    {children}
  </Flex>
);

export const Dialog = Object.assign(DialogRoot, {
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter
});
