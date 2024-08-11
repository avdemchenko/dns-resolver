import type { NS_RECORD_TYPE } from '.'

import { AAAA_RECORD_TYPE, A_RECORD_TYPE } from '.'

/**
 * Type representing the supported DNS record types for interpretation.
 *
 * `DNSType` can be one of the following:
 * - `A_RECORD_TYPE`: Represents an IPv4 address record.
 * - `AAAA_RECORD_TYPE`: Represents an IPv6 address record.
 * - `NS_RECORD_TYPE`: Represents a name server record (not supported by `interpretRDataARecord`).
 */
export type DNSType =
  | typeof A_RECORD_TYPE
  | typeof AAAA_RECORD_TYPE
  | typeof NS_RECORD_TYPE

/**
 * Interprets the RDATA of a DNS record for A and AAAA record types.
 *
 * This function takes the RDATA (resource data) and the DNS record type, then interprets
 * the RDATA accordingly. If the record type is `A_RECORD_TYPE`, it returns the IPv4 address.
 * If the record type is `AAAA_RECORD_TYPE`, it returns the IPv6 address. For other types,
 * it returns the raw RDATA as a hexadecimal string.
 *
 * @param {Buffer} rdata - The RDATA buffer containing the DNS resource data.
 * @param {Exclude<DNSType, typeof NS_RECORD_TYPE>} type - The DNS record type, either `A_RECORD_TYPE` or `AAAA_RECORD_TYPE`.
 *
 * @returns {string} - The interpreted IP address or the hexadecimal string representation of the RDATA.
 */
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

/**
 * Interprets the RDATA buffer as an IPv4 address.
 *
 * This helper function converts the RDATA buffer into a dotted decimal format
 * string, representing an IPv4 address.
 *
 * @param {Buffer} rdata - The RDATA buffer containing the IPv4 address.
 *
 * @returns {string} - The interpreted IPv4 address in dotted decimal format.
 */
function interpretIPv4Address(rdata: Buffer) {
  const ipAddressArray = Array.from(rdata)
  return ipAddressArray.join('.')
}

const HEX_BASE = 16

/**
 * Interprets the RDATA buffer as an IPv6 address.
 *
 * This helper function converts the RDATA buffer into a colon-separated hexadecimal
 * string, representing an IPv6 address.
 *
 * @param {Buffer} rdata - The RDATA buffer containing the IPv6 address.
 *
 * @returns {string} - The interpreted IPv6 address in colon-separated hexadecimal format.
 */
function interpretIPv6Address(rdata: Buffer) {
  const parts: Array<string> = []

  for (let byteIndex = 0; byteIndex < rdata.length; byteIndex += 2) {
    const groupValue = rdata.readUInt16BE(byteIndex)
    const hexString = groupValue.toString(HEX_BASE)
    parts.push(hexString)
  }

  return parts.join(':')
}
