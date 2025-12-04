import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { AppProviders } from '@/components/providers/AppProviders'

/**
 * Custom render function that wraps components with the same providers used in the app
 * Use this instead of the default render from @testing-library/react
 *
 * @example
 * import { render, screen } from '@/test/test-utils'
 *
 * render(<MyComponent />)
 * expect(screen.getByText('Hello')).toBeInTheDocument()
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AppProviders, ...options })

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render method with our custom one
export { customRender as render }