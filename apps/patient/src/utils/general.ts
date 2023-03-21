import { Address } from './models'

export const titleCase = (str: string) =>
  str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const formatAddress = (address: Address) => {
  const { city, postalCode, state, street1, street2 } = address
  return `${titleCase(street1)}${street2 ? `, ${titleCase(street2)}` : ''}, ${titleCase(
    city
  )}, ${state} ${postalCode}`
}
