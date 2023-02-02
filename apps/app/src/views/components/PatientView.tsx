import NameView from './NameView'

interface PatientViewProps {
  patient: any
}

const PatientView = (props: PatientViewProps) => {
  const sexMap: object = {
    MALE: 'Male',
    FEMALE: 'Female',
    UNKNOWN: 'Unknown'
  }

  const { patient } = props
  const sex = sexMap[patient.sex as keyof object] || ''
  const gender = patient.gender ? ` (${patient.gender})` : ''

  return <NameView name={patient.name?.full} sub={sex + gender} isPatient patientId={patient.id} />
}

export default PatientView
