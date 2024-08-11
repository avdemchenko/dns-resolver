/**
 * Parses a domain name from a DNS message buffer.
 *
 * This function reads a domain name from a DNS message buffer, starting at the given offset.
 * The domain name may be in a compressed format, which uses pointers to reference previously
 * mentioned labels in the message. The function handles both normal and compressed domain names.
 *
 * @param {Buffer} buffer - The buffer containing the DNS message.
 * @param {number} offset - The offset in the buffer where the domain name starts.
 *
 * @returns {object} - An object containing:
 *  - `domainName` (string): The fully qualified domain name (FQDN) parsed from the buffer.
 *  - `newOffset` (number): The new offset in the buffer after reading the domain name.
 */
export function parseDomainName(buffer: Buffer, offset: number) {
  let name = ''
  let hasEncounteredPointer = false
  let originalOffset = offset

  while (true) {
    const lengthByte = buffer[offset]

    if (isEndOfName(lengthByte)) {
      offset = offset + 1
      break
    }

    if (isPointerIndicator(lengthByte)) {
      if (!hasEncounteredPointer) {
        originalOffset = offset + 2
        hasEncounteredPointer = true
      }
      offset = calculatePointerOffset(lengthByte, buffer, offset)
      continue
    }

    const label = readLabel(buffer, offset, lengthByte)
    name = name + label + '.'
    offset = offset + lengthByte + 1
  }

  return {
    domainName: name,
    newOffset: hasEncounteredPointer ? originalOffset : offset,
  }
}

/**
 * Checks if the given byte indicates the end of a domain name.
 *
 * @param {number} lengthByte - The current byte being checked.
 *
 * @returns {boolean} - `true` if the byte is 0, indicating the end of the domain name.
 */
function isEndOfName(lengthByte: number) {
  return lengthByte === 0
}

/**
 * Checks if the given byte is a pointer indicator in DNS name compression.
 *
 * In DNS name compression, a pointer is indicated by the two most significant bits set to 1 (i.e., `0xc0`).
 *
 * @param {number} lengthByte - The current byte being checked.
 *
 * @returns {boolean} - `true` if the byte indicates a pointer.
 */
function isPointerIndicator(lengthByte: number) {
  return (lengthByte & 0xc0) === 0xc0
}

/**
 * Calculates the offset of a pointer in the DNS message buffer.
 *
 * The offset is calculated by combining the pointer byte (with the two most significant bits masked off)
 * and the next byte in the buffer.
 *
 * @param {number} lengthByte - The pointer byte.
 * @param {Buffer} buffer - The buffer containing the DNS message.
 * @param {number} currentOffset - The current offset in the buffer.
 *
 * @returns {number} - The calculated offset where the pointer points to in the buffer.
 */
function calculatePointerOffset(
  lengthByte: number,
  buffer: Buffer,
  currentOffset: number
) {
  return ((lengthByte & 0x3f) << 8) | buffer[currentOffset + 1]
}

/**
 * Reads a label (a segment of a domain name) from the DNS message buffer.
 *
 * A label is a sequence of characters in the domain name, which is prefixed with a byte indicating its length.
 *
 * @param {Buffer} buffer - The buffer containing the DNS message.
 * @param {number} offset - The offset in the buffer where the label starts.
 * @param {number} length - The length of the label.
 *
 * @returns {string} - The label as a string.
 */
function readLabel(buffer: Buffer, offset: number, length: number) {
  const startOfLabel = offset + 1
  const endOfLabel = startOfLabel + length

  return buffer.toString('ascii', startOfLabel, endOfLabel)
}
