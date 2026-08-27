import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Treatment } from '@photonhealth/sdk/dist/clinical-api/types';
import { PrescriptionTemplate } from '@photonhealth/sdk/dist/types';

vi.mock('solid-element', () => ({ customElement: vi.fn() }));

const catalogStore = {
  store: {
    catalogs: { data: [], errors: [], isLoading: false },
    catalog: {
      data: undefined as { id: string; treatments: unknown[]; templates: unknown[] } | undefined,
      errors: [],
      isLoading: false
    }
  }
};

vi.mock('../stores/catalog', () => ({ CatalogStore: catalogStore }));

const { getFilteredData } = await import('./photon-medication-search-component');

beforeEach(() => {
  // `data` is filled in on mount via CatalogStore.actions.getCatalog() (resolves a GraphQL query)
  // these tests assign it directly, so reset the singleton here
  catalogStore.store.catalog.data = undefined;
});

describe('getFilteredData', () => {
  it('returns nothing until the catalog has loaded', () => {
    const result = getFilteredData(props(), '', [
      allTreatmentsEntry('med_all_treatments', 'All Treatments Med')
    ]);

    expect(result).toEqual([]);
  });

  it('lists organization catalog, templates and all treatments together', () => {
    setCatalog({
      treatments: [treatment('med_catalog_one', 'Catalog Med One')],
      templates: [template('tmp_template', 'med_template', 'Template Med')]
    });

    const result = getFilteredData(props(), '', [
      allTreatmentsEntry('med_all_treatments', 'All Treatments Med')
    ]);

    expect(namesOf(result)).toEqual(['Template Med', 'Catalog Med One', 'All Treatments Med']);
  });

  it('drops an all treatments entry duplicating a catalogued medication, keeping the catalogued id', () => {
    setCatalog({ treatments: [treatment('med_catalog_one', 'Catalog Med One')] });

    const treatmentOptionsWithDupe = [
      allTreatmentsEntry('med_catalog_one_dupeID', 'Catalog Med One')
    ];

    const result = getFilteredData(props(), 'catalog med one', treatmentOptionsWithDupe);

    expect(result).toMatchObject([{ id: 'med_catalog_one' }]);
  });

  it('matches duplicates irrespective of case and surrounding whitespace', () => {
    setCatalog({ treatments: [treatment('med_catalog_mixed_case', 'Catalog Med Mixed Case')] });

    const result = getFilteredData(props(), '', [
      allTreatmentsEntry('med_newer_ndc_of_catalog_mixed_case', '  catalog med MIXED case  ')
    ]);

    expect(result).toMatchObject([{ id: 'med_catalog_mixed_case' }]);
  });

  it('keeps an all treatments entry whose name merely shares a prefix with a catalogued one', () => {
    setCatalog({ treatments: [treatment('med_catalog_one', 'Catalog Med One')] });

    const result = getFilteredData(props(), 'catalog med', [
      allTreatmentsEntry('med_all_treatments', 'Catalog Med One Hundred')
    ]);

    expect(result).toMatchObject([{ id: 'med_catalog_one' }, { id: 'med_all_treatments' }]);
  });

  it('keeps an all treatments entry the org has not catalogued', () => {
    setCatalog({ treatments: [treatment('med_catalog_one', 'Catalog Med One')] });

    const result = getFilteredData(props(), 'all treatments', [
      allTreatmentsEntry('med_all_treatments', 'All Treatments Med')
    ]);

    expect(result).toMatchObject([{ id: 'med_all_treatments' }]);
  });

  it('does not dedupe against templates, so a templated medication is still searchable', () => {
    setCatalog({ templates: [template('tmp_template', 'med_template', 'Template Med')] });

    const result = getFilteredData(props(), 'template med', [
      allTreatmentsEntry('med_newer_ndc_of_template', 'Template Med')
    ]);

    expect(result).toMatchObject([{ id: 'tmp_template' }, { id: 'med_newer_ndc_of_template' }]);
  });

  it('still narrows the combined list by every search term', () => {
    setCatalog({
      treatments: [
        treatment('med_catalog_one', 'Catalog Med One'),
        treatment('med_catalog_two', 'Catalog Med Two')
      ]
    });

    const result = getFilteredData(props(), 'catalog one', [
      allTreatmentsEntry('med_all_treatments', 'All Treatments Med')
    ]);

    expect(result).toMatchObject([{ id: 'med_catalog_one' }]);
  });

  it('keeps the off catalog option at the head of the list', () => {
    setCatalog({ treatments: [treatment('med_catalog_one', 'Catalog Med One')] });

    const result = getFilteredData(
      props({ offCatalogOption: treatment('med_off_catalog', 'Off Catalog Med') }),
      '',
      []
    );

    expect(result).toMatchObject([{ id: 'med_off_catalog' }, { id: 'med_catalog_one' }]);
  });
});

function treatment(id: string, name: string) {
  return { id, name } as Treatment;
}

function allTreatmentsEntry(id: string, name: string) {
  return { id, name, isOffCatalog: true } as unknown as Treatment;
}

function template(id: string, treatmentId: string, treatmentName: string) {
  return {
    id,
    name: `${treatmentName} Template`,
    treatment: treatment(treatmentId, treatmentName)
  } as PrescriptionTemplate;
}

function setCatalog({
  treatments = [] as Treatment[],
  templates = [] as PrescriptionTemplate[]
} = {}) {
  catalogStore.store.catalog.data = { id: 'cat_01', treatments, templates };
}

function props(overrides = {}) {
  return { disabled: false, searchText: '', ...overrides } as any;
}

function namesOf(items: ReturnType<typeof getFilteredData>) {
  return items.map((i) => ('treatment' in i ? i.treatment.name : i.name));
}
