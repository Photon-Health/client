import { FieldAttributes, Field } from 'formik';
import { Input, InputGroup, InputRightElement, Spinner } from '@chakra-ui/react';

export const LoadingInputField = (props: FieldAttributes<any>) => {
  const { loading, displayOnly, disabled } = props;

  return (
    <InputGroup>
      {displayOnly ? <Input disabled={disabled} /> : <Field {...props} as={Input} />}
      {loading && (
        <InputRightElement>
          <Spinner size="sm" />
        </InputRightElement>
      )}
    </InputGroup>
  );
};
