import Banner from '../../particles/Banner';

export const PharmacyRoutingAlert = () => {
  return (
    <Banner iconName="exclamationTriangle" status={'warning'} withBorder>
      One or more prescriptions in the order cannot be filled at this pharmacy.
    </Banner>
  );
};
