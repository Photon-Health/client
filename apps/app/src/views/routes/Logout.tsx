import { usePhoton } from 'packages/react';
import { Navigate } from 'react-router-dom';

export const Logout = () => {
  const { logout } = usePhoton();
  logout({
    returnTo: window.location.origin
  });

  return <Navigate to="/login" />;
};
