import { usePhoton } from '@photonhealth/react';
import jwtDecode from 'jwt-decode';
import { Permission } from 'packages/sdk/dist/types';
import { useEffect, useState } from 'react';

function checkHasPermission(subset: Permission[], superset: Permission[]) {
  return subset.every((permission) => superset.includes(permission));
}

const usePermissions = (permissions: Permission[]) => {
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const { getToken } = usePhoton();

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const token = await getToken();
        const decoded: { permissions: Permission[] } = jwtDecode(token);
        setUserPermissions(decoded?.permissions || []);
      } catch {
        console.error('Something went wrong decoding user permissions');
        setUserPermissions([]);
      }
    };

    getPermissions();
  }, []);

  return checkHasPermission(permissions, userPermissions);
};

export default usePermissions;
