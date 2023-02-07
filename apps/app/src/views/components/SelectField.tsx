import { Select, NoticeProps, chakraComponents } from 'chakra-react-select';
import { useField, FieldAttributes } from 'formik';
import { Button, Text, HStack, forwardRef } from '@chakra-ui/react';
import { useEffect } from 'react';

const NoOptionsMessage =
  (
    onExpandedSearchClick: () => void,
    expandedSearchLabel: string,
    expandedSearchNoResultsLabel: string
  ) =>
  ({ children, ...props }: NoticeProps) => {
    return (
      <chakraComponents.NoOptionsMessage {...props}>
        <Text>{expandedSearchNoResultsLabel}</Text>
        <HStack px={4} py={0} mt={2} display="flex" justifyContent="stretch" borderRadius={5}>
          <Button
            variant="outline"
            color="blue.500"
            borderColor="blue.500"
            width="full"
            onClick={onExpandedSearchClick}
          >
            {expandedSearchLabel}
          </Button>
        </HStack>
      </chakraComponents.NoOptionsMessage>
    );
  };

export const SelectField = forwardRef((props: FieldAttributes<any>, ref: any) => {
  const {
    name,
    options,
    onChange,
    expandedSearch,
    onExpandedSearchClick,
    expandedSearchLabel,
    expandedSearchNoResultsLabel,
    paginated,
    setFilterText,
    filterText,
    fetchMoreData,
    hasMore,
    onFormPopulated
  } = props;
  const [field, meta, { setValue, setTouched }] = useField(name);

  const fetchMore = () => {
    if (paginated && hasMore) {
      fetchMoreData();
    }
  };

  useEffect(() => {
    if (onFormPopulated && meta.touched === false && meta.value.length > 0 && options.length > 0) {
      if (!options.map((y: any) => y.value).includes(meta.value)) {
        onFormPopulated(meta.value);
      }
    }
  }, [meta.touched, options]);

  const onChanged = (selected: any) => {
    if (onChange && selected?.value) onChange(selected.value);

    if (!selected || !selected.value) {
      setValue({ value: '', label: '' });
    } else if (Array.isArray(selected)) {
      const values = selected.map((s) => s.value);
      setValue(values);
    } else {
      setValue(selected.value);
    }
  };

  const isEqual = (option: any) => option?.value === field.value;

  const customNoOptions = NoOptionsMessage(
    () => onExpandedSearchClick(filterText),
    expandedSearchLabel,
    expandedSearchNoResultsLabel
  );

  const handleSearch = (val: string) => {
    if (setFilterText) {
      if (val !== filterText) {
        setFilterText(val);
      }
    }
  };

  return (
    <Select
      ref={ref}
      {...props}
      placeholder=""
      onChange={onChanged}
      onBlur={setTouched}
      value={options?.find(isEqual)}
      onInputChange={handleSearch}
      onMenuScrollToBottom={fetchMore}
      blurInputOnSelect={false}
      validateOnBlur={false}
      components={
        expandedSearch
          ? { NoOptionsMessage: customNoOptions, ...props.components }
          : { ...props.components }
      }
    />
  );
});
