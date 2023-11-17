import { useLazyQuery } from '@apollo/client';
import { graphql } from 'apps/app/src/gql';
import { AsyncSelect, OptionProps, components } from 'chakra-react-select';
import { Text } from '@chakra-ui/react';
import * as yup from 'yup';
import { useClinicalApiClient } from '../../apollo';
export const rolesSchema = yup.array(
  yup
    .object({
      value: yup.string().required(),
      label: yup.string().required()
    })
    .required()
);

const allRolesQuery = graphql(/* GraphQL */ `
  query AllRolesSelect {
    roles {
      id
      name
      description
    }
  }
`);

type Role = { value: string; label: string; description?: string };

const Option = (props: OptionProps<Role>) => {
  return (
    <components.Option {...props}>
      <div>{props.label}</div>
      {props.data.description && (
        <Text color="muted" fontSize="sm">
          {props.data.description}
        </Text>
      )}
    </components.Option>
  );
};
export interface RolesSelectProps {
  onChange: (role: readonly Role[]) => void;
  onBlur: () => void;
  value: Role[];
}
export const RolesSelect = (props: RolesSelectProps) => {
  const client = useClinicalApiClient();
  const [loadRoleOptions] = useLazyQuery(allRolesQuery, {
    client,
    fetchPolicy: 'cache-first'
  });

  const loadOptions = async () => {
    const roles = (await loadRoleOptions()).data?.roles ?? [];
    return roles
      .map(({ name, id, description }) => ({
        value: id,
        label: name ?? id,
        description: description ?? undefined
      }))
      .sort();
  };

  return (
    <AsyncSelect
      loadOptions={loadOptions}
      components={{ Option }}
      cacheOptions
      defaultOptions
      isMulti
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
    />
  );
};
