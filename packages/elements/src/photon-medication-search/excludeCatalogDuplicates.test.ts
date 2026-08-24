import { describe, expect, it } from 'vitest';
import { Treatment } from '@photonhealth/sdk/dist/clinical-api/types';
import { excludeCatalogDuplicates } from './photon-medication-search-component';

const treatment = (id: string, name: string) => ({ id, name } as Treatment);

describe('excludeCatalogDuplicates', () => {
  it('drops a search result that duplicates a catalogued medication name', () => {
    const result = excludeCatalogDuplicates(
      [treatment('med_new', 'Ondansetron HCl Oral Tablet 4 MG')],
      [treatment('med_catalogued', 'Ondansetron HCl Oral Tablet 4 MG')]
    );

    expect(result).toHaveLength(0);
  });

  it('keeps a search result not present in the catalog', () => {
    const result = excludeCatalogDuplicates(
      [treatment('med_new', 'Famotidine Oral Tablet 20 MG')],
      [treatment('med_catalogued', 'Ondansetron HCl Oral Tablet 4 MG')]
    );

    expect(result).toMatchObject([{ id: 'med_new' }]);
  });

  it('matches names irrespective of case and surrounding whitespace', () => {
    const result = excludeCatalogDuplicates(
      [treatment('med_new', 'ondansetron hcl oral tablet 4 mg ')],
      [treatment('med_catalogued', 'Ondansetron HCl Oral Tablet 4 MG')]
    );

    expect(result).toHaveLength(0);
  });

  it('keeps different strengths of the same medication', () => {
    const result = excludeCatalogDuplicates(
      [treatment('med_new', 'Ondansetron HCl Oral Tablet 8 MG')],
      [treatment('med_catalogued', 'Ondansetron HCl Oral Tablet 4 MG')]
    );

    expect(result).toMatchObject([{ id: 'med_new' }]);
  });

  it('returns search results untouched for an empty catalog', () => {
    const result = excludeCatalogDuplicates(
      [treatment('med_new', 'Synthroid Oral Tablet 25 MCG')],
      []
    );

    expect(result).toMatchObject([{ id: 'med_new' }]);
  });
});
