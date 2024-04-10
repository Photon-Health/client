import { preparePharmacyOptions } from './general'; // Update the import path according to your project structure
import { types } from '@photonhealth/sdk';

describe('preparePharmacyOptions', () => {
  it('should dedupe pharmacy options when merging new and existing pharmacies', () => {
    // Arrange
    const existingPharmacies = [
      { id: '1', name: 'Pharmacy A' },
      { id: '2', name: 'Pharmacy B' }
    ];

    const newPharmacies = [
      { id: '2', name: 'Pharmacy B' },
      { id: '3', name: 'Pharmacy C' }
    ];

    // Act
    const result = preparePharmacyOptions(newPharmacies, existingPharmacies);

    // Assert
    expect(result).toHaveLength(3); // Expected length after merging
    expect(result).toEqual([
      { id: 1, name: 'Pharmacy A' },
      { id: 2, name: 'Pharmacy B' }, // Existing pharmacy
      { id: 3, name: 'Pharmacy C' } // New pharmacy
    ]);
  });

  it('should return existing pharmacies when newPharmacies is empty', () => {
    // Arrange
    const existingPharmacies = [
      { id: 1, name: 'Pharmacy A' },
      { id: 2, name: 'Pharmacy B' }
    ];

    const newPharmacies: types.Pharmacy[] = []; // Empty array

    // Act
    const result = preparePharmacyOptions(newPharmacies, existingPharmacies);

    // Assert
    expect(result).toEqual(existingPharmacies);
  });

  it('should return only newPharmacies when existingPharmacies is empty', () => {
    // Arrange
    const existingPharmacies: EnrichedPharmacy[] = []; // Empty array

    const newPharmacies = [
      { id: 1, name: 'Pharmacy A' },
      { id: 2, name: 'Pharmacy B' }
    ];

    // Act
    const result = preparePharmacyOptions(newPharmacies, existingPharmacies);

    // Assert
    expect(result).toEqual(newPharmacies);
  });
});
