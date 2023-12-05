import { createContext, JSXElement, useContext } from 'solid-js';

const RecentOrdersContext = createContext();

interface SDKProviderProps {
  children: JSXElement;
}

export default function RecentOrdersProvider(props: SDKProviderProps) {
  return (
    <RecentOrdersContext.Provider value={{ test: 'Paul' }}>
      {props.children}
    </RecentOrdersContext.Provider>
  );
}

export function usePhotonClient() {
  return useContext(RecentOrdersContext);
}
