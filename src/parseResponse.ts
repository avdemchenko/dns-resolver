import type { DNSRecord } from '.'
import type { DNSType } from './interpretRDataARecord'

import { interpretRDataARecord } from './interpretRDataARecord'
import { parseDomainName } from './parseDomainName'

import { NS_RECORD_TYPE } from '.'

interface Header {
  transactionID: number
  questionsCount: number
  answersCount: number
  authorityCount: number
  additionalCount: number
}

/**
 * Parses a DNS response buffer and extracts the header, question, and resource records.
 *
 * This function processes a DNS response message, extracting and returning its header,
 * question section, and the answer, authority, and additional records. It throws an error
 * if the buffer does not represent a valid DNS response.
 *
 * @param {Buffer} buffer - The buffer containing the DNS response message.
 *
 * @returns {object} - An object representing the parsed DNS response, containing:
 *  - `header`: The DNS header with transaction ID and record counts.
 *  - `questionName`: The domain name from the question section.
 *  - `answerRecords`: The list of parsed answer records.
 *  - `authorityRecords`: The list of parsed authority records.
 *  - `additionalRecords`: The list of parsed additional records.
 */
export function parseResponse(buffer: Buffer) {
  if (!isResponse(buffer)) {
    throw new Error('Not a DNS response.')
  }

  const header = parseHeader(buffer)
  let offset = 12
  const question = parseQuestionSection(buffer, offset)
  offset = question.newOffset + 4

  const answerRecords = parseSections(buffer, header.answersCount, offset)
  offset = updateOffset(answerRecords, offset)
  const authorityRecords = parseSections(buffer, header.authorityCount, offset)
  offset = updateOffset(authorityRecords, offset)
  const additionalRecords = parseSections(
    buffer,
    header.additionalCount,
    offset
  )

  const finalResponse = {
    header,
    questionName: question.domainName,
    answerRecords,
    authorityRecords,
    additionalRecords,
  }

  return finalResponse
}

/**
 * Checks if the buffer represents a DNS response message.
 *
 * This function checks the flags in the DNS message header to determine whether
 * the message is a response.
 *
 * @param {Buffer} buffer - The buffer containing the DNS message.
 *
 * @returns {boolean} - `true` if the message is a response, `false` otherwise.
 */
function isResponse(buffer: Buffer) {
  const flags = buffer.readUInt16BE(2)
  return (flags & 0x8000) !== 0
}

/**
 * Parses the DNS header from the buffer.
 *
 * This function extracts and returns the DNS header information, including
 * transaction ID, and the counts of questions, answers, authority, and additional records.
 *
 * @param {Buffer} buffer - The buffer containing the DNS message.
 *
 * @returns {Header} - The parsed DNS header.
 */
function parseHeader(buffer: Buffer): Header {
  const header = {
    transactionID: buffer.readUInt16BE(0),
    questionsCount: buffer.readUInt16BE(4),
    answersCount: buffer.readUInt16BE(6),
    authorityCount: buffer.readUInt16BE(8),
    additionalCount: buffer.readUInt16BE(10),
  }

  return header
}

/**
 * Parses the question section of the DNS message.
 *
 * This function parses the domain name in the question section and returns it along with the
 * new offset after reading the domain name.
 *
 * @param {Buffer} buffer - The buffer containing the DNS message.
 * @param {number} offset - The offset in the buffer where the question section starts.
 *
 * @returns {object} - An object containing:
 *  - `domainName`: The parsed domain name.
 *  - `newOffset`: The offset after parsing the domain name.
 */
function parseQuestionSection(buffer: Buffer, offset: number) {
  const question = parseDomainName(buffer, offset)

  return question
}

/**
 * Parses multiple sections (e.g., answer, authority, or additional sections) in the DNS message.
 *
 * This function parses a specified number of DNS resource records starting from the given offset.
 *
 * @param {Buffer} buffer - The buffer containing the DNS message.
 * @param {number} count - The number of resource records to parse.
 * @param {number} startOffset - The offset in the buffer where the sections start.
 *
 * @returns {Array<DNSRecord>} - An array of parsed DNS records.
 */
function parseSections(buffer: Buffer, count: number, startOffset: number) {
  let offset = startOffset
  const records = []

  for (let i = 0; i < count; i++) {
    const record = parseRecord(buffer, offset)
    records.push(record)
    offset = record.offset
  }

  return records
}

/**
 * Parses a single DNS resource record from the buffer.
 *
 * This function extracts the domain name, record type, and resource data (RDATA) from a DNS
 * resource record in the buffer, interpreting the RDATA as appropriate for the record type.
 *
 * @param {Buffer} buffer - The buffer containing the DNS message.
 * @param {number} offset - The offset in the buffer where the record starts.
 *
 * @returns {DNSRecord} - The parsed DNS record, including the domain name, type, and RDATA.
 */
function parseRecord(buffer: Buffer, offset: number): DNSRecord {
  const domainNameData = parseDomainName(buffer, offset)
  offset = domainNameData.newOffset

  const type = buffer.readUInt16BE(offset) as DNSType
  offset += 2

  offset += 2
  offset += 4

  const dataLength = buffer.readUInt16BE(offset)
  offset += 2

  let rdata: string

  if (type === NS_RECORD_TYPE) {
    const { domainName, newOffset } = parseDomainName(buffer, offset)
    offset = newOffset
    rdata = domainName
  } else {
    const rdataBuffer = buffer.slice(offset, offset + dataLength)

    rdata = interpretRDataARecord({
      rdata: rdataBuffer,
      type,
    })
    offset += dataLength
  }

  return {
    domainName: domainNameData.domainName,
    type,
    rdata,
    offset,
  }
}

/**
 * Updates the offset based on the last parsed record in the section.
 *
 * This function returns the updated offset after parsing a series of DNS records.
 *
 * @param {Array<DNSRecord>} records - The list of parsed DNS records.
 * @param {number} currentOffset - The current offset in the buffer.
 *
 * @returns {number} - The updated offset after the last parsed record.
 */
function updateOffset(records: Array<DNSRecord>, currentOffset: number) {
  return records.length > 0 ? records[records.length - 1].offset : currentOffset
}
