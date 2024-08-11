import { expect, it } from 'vitest'

import { interpretRDataARecord } from '../interpretRDataARecord'

it('should interpret rdata for type 1, A records', () => {
  const rdata = Buffer.from([192, 168, 1, 1])
  const type = 1

  const expected = '192.168.1.1'

  expect(
    interpretRDataARecord({
      rdata,
      type,
    })
  ).toBe(expected)
})

it('should interpret rdata for type 28, AAAA records', () => {
  const rdata = Buffer.from([
    32, 1, 13, 184, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  ])
  const type = 28
  const expected = '2001:db8:0:800:0:0:0:1'

  expect(
    interpretRDataARecord({
      rdata,
      type,
    })
  ).toBe(expected)
})
