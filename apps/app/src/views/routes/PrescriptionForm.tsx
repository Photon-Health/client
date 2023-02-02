import { MutableRefObject, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-multirx-form-wrapper': unknown
    }
  }
}

export const PrescriptionForm = () => {
  const ref: MutableRefObject<any> = useRef()
  const [params] = useSearchParams()
  const patientId = params.get('patientId') || ''

  const navigate = useNavigate()
  const onClose = () => {
    navigate('/prescriptions')
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('photon-prescriptions-created', (e: any) => {
        if (!e.detail.createdOrder) {
          onClose()
        }
        if (e.detail.createOrder) {
          const searchParams = new URLSearchParams()
          searchParams.append('patientId', e.detail.patientId)
          searchParams.append('prescriptionIds', e.detail.prescriptionIds.join(','))
          navigate({
            pathname: '/orders/new',
            search: searchParams.toString()
          })
        }
      })
      ref.current.addEventListener('photon-prescriptions-closed', () => {
        onClose()
      })
    }
  }, [ref.current])

  useEffect(() => {
    if (patientId && ref.current) {
      ref.current.patientId = patientId
    }
  }, [ref.current, patientId])

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'white',
        width: '100%',
        zIndex: 15
      }}
    >
      <photon-multirx-form-wrapper ref={ref} />
    </div>
  )
}
