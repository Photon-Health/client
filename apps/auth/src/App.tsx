import './App.css';
import LoginButton from './LoginButton';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton';

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <>
      {!isAuthenticated ? (
        <LoginButton />
      ) : (
        <photon-client
          id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
          org="org_KzSVZBQixLRkqj5d"
          domain="auth.boson.health"
          env="boson"
          audience="https://api.boson.health"
          uri="https://api.boson.health/graphql"
          auto-login="true"
          redirect-uri={`${window.location.origin}?photon-child=true`}
        >
          <div>
            <LogoutButton />
            <div>
              <img src={user.picture} alt={user.name} />
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <photon-prescribe-workflow
              patient-id="pat_01GQ0XFBHSH3YXN936A2D2SD7Y"
              enable-order="true"
              enable-send-to-patient="true"
              enable-local-pickup="true"
              enable-med-history="true"
              mail-order-ids="phr_01GA9HPVBVJ0E65P819FD881N0,phr_01GCA54GVKA06C905DETQ9SY98"
              additional-notes="Some additional notes to add to the message."
              weight="23"
            ></photon-prescribe-workflow>
          </div>
        </photon-client>
      )}
    </>
  );
}

export default App;
