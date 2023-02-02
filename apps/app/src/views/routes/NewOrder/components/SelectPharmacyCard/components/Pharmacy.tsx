import { useState, useEffect } from 'react'
import { Box, Skeleton, SkeletonText, Tag, Text, VStack } from '@chakra-ui/react'
import { usePhoton, types } from '@photonhealth/react'
import { formatAddress } from '../../../../../../utils'

interface PharmacyProps {
  pharmacyId: string
  isPreferred?: boolean
  showTags?: boolean
}

export const Pharmacy = ({ pharmacyId, isPreferred, showTags }: PharmacyProps) => {
  const { getPharmacy } = usePhoton()
  const { refetch, loading } = getPharmacy({ id: '' })

  const [pharmacy, setPharmacy] = useState<types.Pharmacy | undefined>(undefined)

  const getPharm = async () => {
    const result = await refetch({ id: pharmacyId })
    if (result) {
      setPharmacy(result.data.pharmacy)
    }
  }

  useEffect(() => {
    if (pharmacyId) {
      getPharm()
    } else {
      setPharmacy(undefined)
    }
  }, [pharmacyId])

  if (loading || !pharmacy) {
    return (
      <VStack align="start" spacing={2}>
        <Skeleton width="80px" height="20px" borderRadius={5} />
        <SkeletonText noOfLines={1} width="150px" skeletonHeight="4" />
        <SkeletonText noOfLines={1} width="200px" skeletonHeight="4" />
      </VStack>
    )
  }

  return (
    <VStack align="start" spacing={0} wordBreak="break-all">
      {showTags ? (
        <Box>
          {isPreferred ? (
            <Tag size="sm" colorScheme="orange" mb={1} me={2}>
              Preferred
            </Tag>
          ) : null}
          {pharmacy?.fulfillmentTypes?.includes(types.FulfillmentType.MailOrder) ? (
            <Tag size="sm" colorScheme="blue" mb={1}>
              Mail Order
            </Tag>
          ) : null}
          {pharmacy?.fulfillmentTypes?.includes(types.FulfillmentType.PickUp) ? (
            <Tag size="sm" colorScheme="green" mb={1}>
              Pick Up
            </Tag>
          ) : null}
        </Box>
      ) : null}
      <Text>{pharmacy.name}</Text>
      {pharmacy?.address ? <Text color="gray.500">{formatAddress(pharmacy.address)}</Text> : null}
    </VStack>
  )
}

Pharmacy.defaultProps = {
  isPreferred: false,
  showTags: true
}
