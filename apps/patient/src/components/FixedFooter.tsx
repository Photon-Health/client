import { Box, Slide } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface FixedFooterProps {
  children: ReactNode
  show?: boolean
}

export const FixedFooter = ({ children, show }: FixedFooterProps) => {
  return (
    <Slide direction="bottom" in={show}>
      <Box pt={5} pb={3} backgroundColor="white" borderTop="1px" borderColor="gray.100">
        {children}
      </Box>
    </Slide>
  )
}

FixedFooter.defaultProps = {
  show: false
}
