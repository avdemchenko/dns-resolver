import type { NS_RECORD_TYPE } from '.'

import { AAAA_RECORD_TYPE, A_RECORD_TYPE } from '.'

export type DNSType =
  | typeof A_RECORD_TYPE
  | typeof AAAA_RECORD_TYPE
  | typeof NS_RECORD_TYPE

export function interpretRDataARecord({
  rdata,
  type,
}: {
  rdata: Buffer
  type: Exclude<DNSType, typeof NS_RECORD_TYPE>
}) {
  switch (type) {
    case A_RECORD_TYPE:
      return interpretIPv4Address(rdata)
    case AAAA_RECORD_TYPE:
      return interpretIPv6Address(rdata)

    default:
      return rdata.toString('hex')
  }
}

function interpretIPv4Address(rdata: Buffer) {
  const ipAddressArray = Array.from(rdata)
  return ipAddressArray.join('.')
}

const HEX_BASE = 16

function interpretIPv6Address(rdata: Buffer) {
  const parts: Array<string> = []

  for (let byteIndex = 0; byteIndex < rdata.length; byteIndex += 2) {
    const groupValue = rdata.readUInt16BE(byteIndex)
    const hexString = groupValue.toString(HEX_BASE)
    parts.push(hexString)
  }

  return parts.join(':')
}
