import { forwardRef } from '@chakra-ui/react'
import { usePhoton } from '@photonhealth/react'
import { useEffect, useState } from 'react'
import { SelectField } from './SelectField'

export const DispenseUnitSelect = forwardRef((props: any, ref: any) => {
  const { getDispenseUnits } = usePhoton()
  const { dispenseUnits, loading } = getDispenseUnits()
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    if (!loading && dispenseUnits) {
      setOptions(
        dispenseUnits.map((x) => ({
          value: x.name as string,
          label: x.name as string
        }))
      )
    }
  }, [loading, dispenseUnits])

  return <SelectField ref={ref} {...props} options={options} isLoading={loading} />
})
