import test from 'node:test'
import assert from 'node:assert/strict'
import { SECTION_BANNERS } from '../src/data/sectionBanners.js'

test('defines the three approved contextual banners', () => {
  assert.deepEqual(Object.keys(SECTION_BANNERS), ['tracking', 'account', 'orderDetail'])
  assert.deepEqual(
    Object.values(SECTION_BANNERS).map(({ number }) => number),
    ['01', '02', '03'],
  )

  for (const banner of Object.values(SECTION_BANNERS)) {
    assert.ok(banner.eyebrow)
    assert.ok(banner.title)
    assert.ok(banner.description)
    assert.match(banner.image, /^\/products\/generated\/.+\.png$/)
  }
})
