import {
  Box,
  Center,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Text,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { usePhoton } from '@photonhealth/react'
import { SelectField } from './SelectField'
import { RadioCard, RadioCardGroup } from './RadioCardGroup'
import { unique } from '../../utils'

const ConceptSelect = forwardRef((props: any, ref) => {
  const { setFilterText, filterText, setDrugbankPCID } = props
  const { getMedicationConcepts } = usePhoton()
  const { medicationConcepts, loading, query } = getMedicationConcepts({
    name: filterText,
    defer: true
  })
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    const getConcepts = async () => {
      await query!({ name: filterText })
    }
    if (filterText.length > 0) {
      getConcepts()
    }
  }, [filterText])

  useEffect(() => {
    if (filterText.length > 0) {
      setOptions(
        medicationConcepts.map((x: any) => ({
          value: x.id,
          label: x.name
        }))
      )
    }
  }, [medicationConcepts])

  return (
    <FormControl>
      <FormLabel>Medication Name</FormLabel>
      <SelectField
        ref={ref}
        name="medicationName"
        options={options}
        setFilterText={setFilterText}
        filterOption={() => true}
        placeholder="Search by name"
        onChange={(e: any) => {
          setDrugbankPCID(e)
        }}
        isLoading={loading}
      />
    </FormControl>
  )
})

const StrengthSelect = (props: any) => {
  const { drugbankPCID, setDrugbankPCID, isDisabled } = props
  const { getMedicationStrengths } = usePhoton()
  const { medicationStrengths, loading, query } = getMedicationStrengths({
    id: drugbankPCID,
    defer: true
  })
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const selectInputRef = useRef<any>()

  useEffect(() => {
    const getConcepts = async () => {
      await query!({ id: drugbankPCID })
    }
    if (drugbankPCID) {
      if (selectInputRef.current) {
        if (selectInputRef.current.getValue().length > 0) {
          selectInputRef.current.setValue(null)
          setDrugbankPCID(null)
        }
      }
      getConcepts()
      setDrugbankPCID(undefined)
    } else if (selectInputRef.current) {
      if (selectInputRef.current.getValue().length > 0) {
        selectInputRef.current.setValue(null)
        setDrugbankPCID(null)
      }
    }
  }, [drugbankPCID])

  useEffect(() => {
    if (drugbankPCID) {
      setOptions(
        medicationStrengths.map((x: any) => ({
          value: x.id,
          label: x.name
        }))
      )
    }
  }, [medicationStrengths])

  return (
    <FormControl>
      <FormLabel>Strength</FormLabel>
      <SelectField
        name="strength"
        ref={selectInputRef}
        options={options}
        onChange={(e: any) => {
          setDrugbankPCID(e)
        }}
        isDisabled={isDisabled}
        isLoading={loading}
      />
    </FormControl>
  )
}

const RouteSelect = (props: any) => {
  const { drugbankPCID, setDrugbankPCID, isDisabled } = props
  const { getMedicationRoutes } = usePhoton()
  const { medicationRoutes, loading, query } = getMedicationRoutes({
    id: drugbankPCID,
    defer: true
  })
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const selectInputRef = useRef<any>()

  useEffect(() => {
    const getConcepts = async () => {
      await query!({ id: drugbankPCID })
    }
    if (drugbankPCID) {
      if (selectInputRef.current) {
        if (selectInputRef.current.getValue().length > 0) {
          selectInputRef.current.setValue(null)
        }
      }
      getConcepts()
      setDrugbankPCID(undefined)
    } else if (selectInputRef.current) {
      if (selectInputRef.current.getValue().length > 0) {
        selectInputRef.current.setValue(null)
        setDrugbankPCID(null)
      }
    }
  }, [drugbankPCID])

  useEffect(() => {
    if (drugbankPCID) {
      setOptions(
        medicationRoutes.map((x: any) => ({
          value: x.id,
          label: x.name
        }))
      )
    }
  }, [medicationRoutes])

  return (
    <FormControl>
      <FormLabel>Route</FormLabel>
      <SelectField
        name="route"
        ref={selectInputRef}
        options={options}
        onChange={(e: any) => {
          setDrugbankPCID(e)
        }}
        isDisabled={isDisabled}
        isLoading={loading}
      />
    </FormControl>
  )
}

const FormSelect = (props: any) => {
  const { drugbankPCID, setDrugbankPCID, isDisabled } = props
  const { getMedicationForms } = usePhoton()
  const { medicationForms, loading, query } = getMedicationForms({
    id: drugbankPCID,
    defer: true
  })
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const selectInputRef = useRef<any>()

  useEffect(() => {
    const getConcepts = async () => {
      await query!({ id: drugbankPCID })
    }
    if (drugbankPCID) {
      if (selectInputRef.current) {
        if (selectInputRef.current.getValue().length > 0) {
          selectInputRef.current.setValue(null)
          setDrugbankPCID(null)
        }
      }
      getConcepts()
      setDrugbankPCID(undefined)
    } else if (selectInputRef.current) {
      if (selectInputRef.current.getValue().length > 0) {
        selectInputRef.current.setValue(null)
        setDrugbankPCID(null)
      }
    }
  }, [drugbankPCID])

  useEffect(() => {
    if (drugbankPCID) {
      setOptions(
        medicationForms.map((x: any) => ({
          value: x.id,
          label: x.form
        }))
      )
    }
  }, [medicationForms])

  return (
    <FormControl>
      <FormLabel>Form</FormLabel>
      <SelectField
        name="form"
        ref={selectInputRef}
        options={options}
        onChange={(e: any) => setDrugbankPCID(e)}
        isDisabled={isDisabled}
        isLoading={loading}
      />
    </FormControl>
  )
}

const ProductSelect = (props: any) => {
  const { drugbankPCID, setSelected, selected, setAddToCatalog } = props
  const { getMedicationProducts } = usePhoton()
  const { medicationProducts, loading, query } = getMedicationProducts({
    id: drugbankPCID,
    defer: true
  })
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const getConcepts = async () => {
      await query!({ id: drugbankPCID })
    }
    if (drugbankPCID) {
      getConcepts()
    }
  }, [drugbankPCID])

  useEffect(() => {
    if (drugbankPCID) {
      const data = unique(medicationProducts, 'name').filter((x) => !x.controlled)
      data.sort((a: any, b: any) => (a.value > b.value ? 1 : -1))
      setProducts(data)
      if (selected) {
        setSelected(undefined)
        setAddToCatalog(false)
      }
    }
  }, [medicationProducts])

  useEffect(() => () => setProducts([]), [])

  return (
    <Box>
      <Text color="gray.700" alignSelf="start" textAlign="left" pb={4}>
        Select a medication:
      </Text>
      {products.length === 0 && drugbankPCID == null ? (
        <Text
          color="gray.400"
          alignSelf="start"
          maxHeight="200"
          fontStyle="italic"
          textAlign="left"
        >
          Please search using the options above
        </Text>
      ) : null}
      {products.length === 0 && drugbankPCID != null && !loading ? (
        <Text
          color="gray.400"
          alignSelf="center"
          maxHeight="200"
          fontStyle="italic"
          textAlign="left"
        >
          No medications found
        </Text>
      ) : null}
      {loading ? (
        <Center>
          <CircularProgress isIndeterminate color="green.300" />
        </Center>
      ) : (
        <Stack spacing="5">
          <RadioCardGroup
            onChange={(e: any) => {
              const parts = e.split(', ')
              setSelected({
                id: parts[0],
                name: parts[1]
              })
            }}
          >
            {products.map((product) => (
              <RadioCard key={product.id} value={`${product.id}, ${product.name}`}>
                <Text color="muted" fontSize="sm">
                  {product.name}
                </Text>
              </RadioCard>
            ))}
          </RadioCardGroup>
        </Stack>
      )}
    </Box>
  )
}

export const AdvancedDrugSearch = forwardRef(
  (
    props: {
      submitRef: any
      hideAddToCatalog?: boolean
      loading?: boolean
      forceMobile?: boolean
    },
    ref
  ) => {
    const { submitRef, hideAddToCatalog, loading, forceMobile } = props
    const [filterText, setFilterText] = useState('')
    const [debouncedFilterText] = useDebounce(filterText, 350)
    const [drugbankPCID, setDrugbankPCID] = useState<string | undefined>()
    const [strengthPCID, setStrengthPCID] = useState<string | undefined>()
    const [routePCID, setRoutePCID] = useState<string | undefined>()
    const [formPCID, setFormPCID] = useState<string | undefined>()
    const [selected, setSelected] = useState<any>()
    const [addToCatalog, setAddToCatalog] = useState<boolean>(false)
    const medNameRef: any = useRef()

    const isMobile = useBreakpointValue({ base: true, md: false }) || forceMobile

    useImperativeHandle(ref, () => ({
      selected,
      addToCatalog,
      setFilterText: (fText: string) => {
        const inputValSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype!,
          'value'
        )!.set
        inputValSetter!.call(medNameRef.current.inputRef, fText)
        const ev = new Event('input', { bubbles: true })
        medNameRef.current.inputRef.dispatchEvent(ev)
        setFilterText(fText)
      }
    }))

    useEffect(() => {
      if (submitRef && submitRef.current) {
        if (selected) {
          submitRef.current.disabled = false
        } else {
          submitRef.current.disabled = true
        }
      }
    }, [submitRef, selected])

    useEffect(() => () => setSelected(undefined), [])

    return (
      <VStack align="stretch">
        <Stack flexDir={isMobile ? 'column' : 'row'} gap="2" alignItems="flex-end">
          <ConceptSelect
            filterText={debouncedFilterText}
            setFilterText={setFilterText}
            setDrugbankPCID={(s: string) => setDrugbankPCID(s)}
            ref={medNameRef}
          />
          <StrengthSelect
            drugbankPCID={drugbankPCID}
            setDrugbankPCID={(s: string) => setStrengthPCID(s)}
            isDisabled={!drugbankPCID}
          />
        </Stack>
        <Stack pt={2} flexDir={isMobile ? 'column' : 'row'} gap="2" alignItems="flex-end">
          <RouteSelect
            drugbankPCID={strengthPCID}
            setDrugbankPCID={(s: string) => setRoutePCID(s)}
            isDisabled={!strengthPCID}
          />
          <FormSelect
            drugbankPCID={routePCID}
            setDrugbankPCID={(s: string) => setFormPCID(s)}
            isDisabled={!routePCID}
          />
        </Stack>
        <Divider pt={8} />
        <Box pt={6} pb={4}>
          <ProductSelect
            drugbankPCID={formPCID ?? routePCID ?? strengthPCID ?? drugbankPCID}
            setSelected={setSelected}
            selected={selected}
            setAddToCatalog={setAddToCatalog}
          />
        </Box>
        {!hideAddToCatalog ? (
          <Box pb={isMobile ? 12 : 0}>
            <Checkbox
              isDisabled={!selected || loading}
              isChecked={addToCatalog}
              onChange={() => setAddToCatalog(!addToCatalog)}
            >
              <Text>Add Medication to Catalog</Text>
            </Checkbox>
          </Box>
        ) : null}
      </VStack>
    )
  }
)

AdvancedDrugSearch.defaultProps = {
  hideAddToCatalog: false,
  loading: false,
  forceMobile: false
}
