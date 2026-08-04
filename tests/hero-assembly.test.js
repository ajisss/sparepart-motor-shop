import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const assetPath = `${projectRoot}public/hero/generated-naked-street-bike.png`

test('approved hero motorcycle is a 1672x941 RGBA PNG', () => {
  assert.equal(existsSync(assetPath), true, 'generated hero motorcycle is missing')

  const png = readFileSync(assetPath)
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(png.toString('ascii', 12, 16), 'IHDR')
  assert.equal(png.readUInt32BE(16), 1672)
  assert.equal(png.readUInt32BE(20), 941)
  assert.equal(png[25], 6, 'PNG must use RGBA color type 6')
})

function decodeRgbaPng(png) {
  const width = png.readUInt32BE(16)
  const height = png.readUInt32BE(20)
  const idat = []
  let offset = 8

  while (offset < png.length) {
    const length = png.readUInt32BE(offset)
    const type = png.toString('ascii', offset + 4, offset + 8)
    if (type === 'IDAT') idat.push(png.subarray(offset + 8, offset + 8 + length))
    offset += length + 12
    if (type === 'IEND') break
  }

  const packed = inflateSync(Buffer.concat(idat))
  const stride = width * 4
  const pixels = Buffer.alloc(stride * height)

  for (let y = 0; y < height; y += 1) {
    const filter = packed[y * (stride + 1)]
    const rowStart = y * (stride + 1) + 1
    const outStart = y * stride

    for (let x = 0; x < stride; x += 1) {
      const raw = packed[rowStart + x]
      const left = x >= 4 ? pixels[outStart + x - 4] : 0
      const up = y > 0 ? pixels[outStart - stride + x] : 0
      const upLeft = y > 0 && x >= 4 ? pixels[outStart - stride + x - 4] : 0
      let value = raw

      if (filter === 1) value += left
      if (filter === 2) value += up
      if (filter === 3) value += Math.floor((left + up) / 2)
      if (filter === 4) {
        const prediction = left + up - upLeft
        const pa = Math.abs(prediction - left)
        const pb = Math.abs(prediction - up)
        const pc = Math.abs(prediction - upLeft)
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft
      }

      assert.ok(filter >= 0 && filter <= 4, `unsupported PNG filter ${filter}`)
      pixels[outStart + x] = value & 255
    }
  }

  return { width, height, pixels }
}

test('hero motorcycle has transparent corners and no visible chroma-green residue', () => {
  const { width, height, pixels } = decodeRgbaPng(readFileSync(assetPath))
  const alphaAt = (x, y) => pixels[(y * width + x) * 4 + 3]

  assert.deepEqual(
    [alphaAt(0, 0), alphaAt(width - 1, 0), alphaAt(0, height - 1), alphaAt(width - 1, height - 1)],
    [0, 0, 0, 0],
  )

  let visible = 0
  let greenResidue = 0
  for (let index = 0; index < pixels.length; index += 4) {
    const [red, green, blue, alpha] = pixels.subarray(index, index + 4)
    if (alpha <= 12) continue
    visible += 1
    if (green > 145 && green > red * 1.35 && green > blue * 1.2) greenResidue += 1
  }

  const coverage = visible / (width * height)
  assert.ok(coverage > 0.37 && coverage < 0.43, `unexpected subject coverage ${coverage}`)
  assert.equal(greenResidue, 0)
})
