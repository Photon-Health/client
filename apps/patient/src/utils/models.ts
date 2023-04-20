export interface Address {
  city: string
  country: string
  postalCode: string
  state: string
  street1: string
  street2?: string
}

export interface Order {
  id: string
  state: OrderState
  fulfillment: {
    state: string
  }
  pharmacy: {
    id: string
    address: Address
    name: string
  }
  organization: {
    id: string
    name: string
  }
  fills: any
  patient: {
    id: string
    name: {
      full: string
    }
  }
}

export interface Pharmacy {
  id: string
  address: Address
  name: string
  info: string
  distance: number
  rating?: string
  businessStatus: string
  hours?: {
    open?: boolean
    is24Hr?: boolean
    opens?: string
    opensDay?: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
    closes?: string
  }
}

export enum OrderState {
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  Error = 'ERROR',
  Pending = 'PENDING',
  Placed = 'PLACED',
  Routing = 'ROUTING'
}
