import { create } from 'react-test-renderer'
import { App } from '../App'

describe('App', () => {
  test('renders correctly', () => {
    const component = create(<App />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
