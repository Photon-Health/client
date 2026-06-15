import { createContext, JSXElement, useContext } from 'solid-js';

export interface PrescriptionScreeningContextType {}

const PrescriptionScreeningContext = createContext<PrescriptionScreeningContextType>();

interface PrescriptionScreeningProviderProps {
  children: JSXElement;
}

export const PrescriptionScreeningProvider = (props: PrescriptionScreeningProviderProps) => {
  const value: PrescriptionScreeningContextType = {};

  return (
    <PrescriptionScreeningContext.Provider value={value}>
      {props.children}
    </PrescriptionScreeningContext.Provider>
  );
};

export const usePrescriptionScreening = () => {
  const context = useContext(PrescriptionScreeningContext);
  if (!context) {
    throw new Error('usePrescriptionScreening must be used within PrescriptionScreeningProvider');
  }
  return context;
};
