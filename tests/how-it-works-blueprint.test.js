import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const componentPath = `${projectRoot}src/components/home/HowItWorksSection.jsx`

test('renders four unique clean-engineering blueprint variants', () => {
  assert.equal(existsSync(componentPath), true, 'HowItWorksSection component is missing')

  const source = readFileSync(componentPath, 'utf8')
  for (const variant of ['select', 'payment', 'warehouse', 'tracking']) {
    assert.match(source, new RegExp(`variant: '${variant}'`))
  }
  assert.ok((source.match(/pathLength="1"/g) ?? []).length >= 4)
  assert.match(source, /aria-hidden="true"/)
})

test('triggers the drafting sequence once and provides reduced-motion fallback', () => {
  assert.equal(existsSync(componentPath), true, 'HowItWorksSection component is missing')

  const component = readFileSync(componentPath, 'utf8')
  const styles = readFileSync(`${projectRoot}src/index.css`, 'utf8')
  const homepage = readFileSync(`${projectRoot}src/pages/HomePage.jsx`, 'utf8')

  assert.match(component, /IntersectionObserver/)
  assert.match(component, /threshold:\s*0\.25/)
  assert.match(component, /observer\.disconnect\(\)/)
  assert.match(styles, /prefers-reduced-motion:\s*reduce/)
  assert.match(homepage, /<HowItWorksSection\s*\/>/)
  assert.doesNotMatch(homepage, /PlaceholderMark/)
})
