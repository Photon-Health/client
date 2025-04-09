import { useEffect, useState } from 'react';

export function EmbedApp1() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('@photonhealth/elements')
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="wrapper">
        <photon-client
          id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
          org="org_KzSVZBQixLRkqj5d"
          domain="auth.boson.health"
          env="boson"
          audience="https://api.boson.health"
          uri="https://api.boson.health/graphql"
          auto-login="true"
        >
          <div style={{ padding: '15px' }} id="parent">
            <photon-prescribe-workflow
              patient-id="pat_01JBHGD32EDTC0RAHC5CY39K85"
              enable-order="true"
              hide-templates="true"
              pharmacy-id="phr_01GA9HPXAF9BC9PC8XM25Q836N"
              template-ids="tmp_01J6DBEHZX11BPMY38G9PWASMH"
              enable-med-history="true"
              enable-med-history-refill-button="true"
              enable-combine-and-duplicate="true"
              id="one"
            ></photon-prescribe-workflow>
          </div>
        </photon-client>
      </div>
    </>
  );
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'photon-prescribe-workflow': unknown;
      'photon-client': unknown;
    }
  }
}
