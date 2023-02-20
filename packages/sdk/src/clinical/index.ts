import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { CatalogQueryManager } from './catalog'
import { MedicationQueryManager } from './medication'
import { MedicalEquipmentQueryManager } from './medicalEquipment'
import { OrderQueryManager } from './order'
import { PatientQueryManager } from './patient'
import { PharmacyQueryManager } from './pharmacy'
import { PrescriptionQueryManager } from './prescription'
import { AllergenQueryManager } from './allergen'
import { PrescriptionTemplateQueryManager } from './prescriptionTemplate'
import { SearchMedicationQueryManager } from './searchMedication'

/**
 * Contains various methods for Photon Clinical API
 */
export class ClinicalQueryManager {
  /**
   * Methods for interacting with Photon Catalogs
   */
  public catalog: CatalogQueryManager
  /**
   * Methods for interacting with Photon SearchMedications
   */
  public searchMedication: SearchMedicationQueryManager
  /**
   * Methods for interacting with Photon Medications
   */
  public medication: MedicationQueryManager
  /**
   * Methods for interacting with Photon Medical Equipment
   */
  public medicalEquipment: MedicalEquipmentQueryManager
  /**
   * Methods for interacting with Photon Orders
   */
  public order: OrderQueryManager
  /**
   * Methods for interacting with Photon Patients
   */
  public patient: PatientQueryManager
  /**
   * Methods for interacting with Photon Pharmacies
   */
  public pharmacy: PharmacyQueryManager
  /**
   * Methods for interacting with Photon Prescriptions
   */
  public prescription: PrescriptionQueryManager
  /**
   * Methods for interacting with Photon Allergens
   */
  public allergens: AllergenQueryManager
  /**
   * Methods for interacting with Photon Prescription Templates
   */
  public prescriptionTemplate: PrescriptionTemplateQueryManager

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.catalog = new CatalogQueryManager(apollo)
    this.medication = new MedicationQueryManager(apollo)
    this.medicalEquipment = new MedicalEquipmentQueryManager(apollo)
    this.searchMedication = new SearchMedicationQueryManager(apollo)
    this.order = new OrderQueryManager(apollo)
    this.patient = new PatientQueryManager(apollo)
    this.pharmacy = new PharmacyQueryManager(apollo)
    this.prescription = new PrescriptionQueryManager(apollo)
    this.allergens = new AllergenQueryManager(apollo)
    this.prescriptionTemplate = new PrescriptionTemplateQueryManager(apollo)
  }
}
