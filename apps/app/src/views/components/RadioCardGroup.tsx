import {
  Box,
  BoxProps,
  Circle,
  createIcon,
  Icon,
  Stack,
  StackProps,
  useId,
  useRadio,
  useRadioGroup,
  UseRadioProps,
  useStyleConfig
} from '@chakra-ui/react';
import React from 'react';

export const CheckIcon = createIcon({
  displayName: 'CheckIcon',
  viewBox: '0 0 12 10',
  path: (
    <polyline
      fill="none"
      strokeWidth="2px"
      stroke="currentColor"
      strokeDasharray="16px"
      points="1.5 6 4.5 9 10.5 1"
    />
  )
});

interface RadioCardGroupProps<T> extends Omit<StackProps, 'onChange'> {
  name?: string;
  value?: T;
  defaultValue?: string;
  onChange?: (value: T) => void;
}

export const RadioCardGroup = <T extends string>(props: RadioCardGroupProps<T>) => {
  const { children, name, defaultValue, value, onChange, ...rest } = props;
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    defaultValue,
    value,
    onChange
  });

  const cards = React.useMemo(
    () =>
      React.Children.toArray(children)
        .filter<React.ReactElement<RadioCardProps>>(React.isValidElement)
        .map((card) => {
          return React.cloneElement(card, {
            radioProps: getRadioProps({
              value: card.props.value
            })
          });
        }),
    [children, getRadioProps]
  );

  return <Stack {...getRootProps(rest)}>{cards}</Stack>;
};

RadioCardGroup.defaultProps = {
  name: undefined,
  value: undefined,
  defaultValue: undefined,
  onChange: undefined
};

interface RadioCardProps extends BoxProps {
  value: string;
  radioProps?: UseRadioProps;
}

export const RadioCard = (props: RadioCardProps) => {
  const { radioProps, children, ...rest } = props;
  const { getInputProps, getCheckboxProps, getLabelProps, state } = useRadio(radioProps);
  const id = useId(undefined, 'radio-button');

  const styles = useStyleConfig('RadioCard', props);
  const inputProps = getInputProps();
  const checkboxProps = getCheckboxProps();
  const labelProps = getLabelProps();
  return (
    <Box
      as="label"
      cursor="pointer"
      {...labelProps}
      sx={{
        '.focus-visible + [data-focus]': {
          boxShadow: 'outline',
          zIndex: 1
        }
      }}
    >
      <input {...inputProps} aria-labelledby={id} />
      <Box sx={styles} {...checkboxProps} {...rest}>
        <Stack direction="row" alignItems="center">
          <Box flex="1">{children}</Box>
          {state.isChecked ? (
            <Circle bg="accent" size="4">
              <Icon as={CheckIcon} boxSize="2.5" color="inverted" />
            </Circle>
          ) : (
            <Circle borderWidth="2px" size="4" />
          )}
        </Stack>
      </Box>
    </Box>
  );
};

RadioCard.defaultProps = {
  radioProps: false
};
