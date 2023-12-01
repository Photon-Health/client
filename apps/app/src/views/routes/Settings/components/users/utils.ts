import { UsersListQueryQuery } from 'apps/app/src/gql/graphql';

export const compareRoles = (roleNameA: string, roleNameB: string) => {
  if (roleNameA === roleNameB) {
    return 0;
  }
  if (roleNameA === 'Prescriber') return -1;
  if (roleNameB === 'Prescriber') return 1;
  if (roleNameA === 'Administrator') return -1;
  if (roleNameB === 'Administrator') return 1;
  return roleNameA.localeCompare(roleNameB);
};

export type Sorts = 'NAME' | 'ROLES' | 'EMAIL';
export const sortByFn =
  (sortBy: Sorts | undefined, dir: boolean) =>
  (a: UsersListQueryQuery['users'][number], b: UsersListQueryQuery['users'][number]) => {
    const multiplier = dir ? 1 : -1;
    if (sortBy === 'NAME') {
      return multiplier * (a.name?.full ?? '').localeCompare(b.name?.full ?? '');
    }
    if (sortBy === 'ROLES') {
      return (
        multiplier *
        a.roles
          .map((r) => r.name ?? 'Unknown Role')
          .sort(compareRoles)
          .join(',')
          .localeCompare(
            b.roles
              .map((r) => r.name ?? 'Unknown Role')
              .sort(compareRoles)
              .join(',')
          )
      );
    }
    if (sortBy === 'EMAIL') {
      return multiplier * (a.email ?? '').localeCompare(b.email ?? '');
    }
    return 0;
  };
