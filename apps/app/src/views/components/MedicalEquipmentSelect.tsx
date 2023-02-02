import { Text } from '@chakra-ui/react'

import { useEffect, useState } from 'react'
import { usePhoton } from '@photonhealth/react'
import { useDebounce } from 'use-debounce'
import { SelectField } from './SelectField'

export const MedicalEquipmentSelect = (props: any) => {
  // By using a useState for options, we can hide options we don't want to show until
  // other conditions (loading) are true
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([])
  const [filterText, setFilterText] = useState('')
  const [filterTextDebounce] = useDebounce(filterText, 250)
  const [name, setName] = useState('')
  const { getMedicalEquipment } = usePhoton()
  const medicalEquipment = getMedicalEquipment({
    name: name.length > 0 ? name : undefined,
    first: 25
  })

  useEffect(() => {
    setName(filterTextDebounce)
  }, [filterTextDebounce])

  useEffect(() => {
    if (!medicalEquipment.loading && medicalEquipment.medicalEquipment) {
      setOptions(
        medicalEquipment.medicalEquipment.map((med: any) => {
          return {
            value: med.id,
            label: `${med.name}`
          }
        })
      )
    }
  }, [medicalEquipment.loading])

  if (medicalEquipment.error?.message) {
    return <Text color="red">{medicalEquipment.error.message}</Text>
  }

  return (
    <SelectField
      {...props}
      expandedSearchLabel="Search all medical equipment"
      enabledExpandedSearch
      filterText={filterText}
      setFilterText={setFilterText}
      isLoading={medicalEquipment.loading}
      options={options}
    />
  )
}
