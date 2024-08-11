import dgram from 'node:dgram'
import net from 'node:net'

import { createDNSQuery } from './createDNSQuery'
import { parseResponse } from './parseResponse'

export interface DNSRecord {
  domainName: string
  type: number
  rdata: string
  offset: number
}

const ROOT_DNS_SERVER = '198.41.0.4'
const DNS_PORT = 53
export const A_RECORD_TYPE = 1
export const AAAA_RECORD_TYPE = 28
export const NS_RECORD_TYPE = 2
const DOMAIN_TO_RESOLVE = 'www.google.com'

/**
 * Sends a DNS query to a specified DNS server and processes the response.
 *
 * This function creates a UDP client socket, constructs a DNS query for the specified domain,
 * and sends it to the given DNS server. Upon receiving a response, the message is parsed,
 * and the DNS response is processed to determine the IP address or next DNS server to query.
 *
 * @param {string} domain - The domain name to resolve (e.g., "www.google.com").
 * @param {string} server - The IP address of the DNS server to send the query to.
 */
function queryDNS(domain: string, server: string) {
  const ipVersion = net.isIP(server)

  const socketType = ipVersion === 6 ? 'udp6' : 'udp4'

  const client = dgram.createSocket(socketType)

  const dnsQuery = createDNSQuery(domain)

  client.send(dnsQuery, DNS_PORT, server, (error) => {
    if (error) {
      console.error('Error sending DNS query:', error)
      client.close()
    } else {
      console.log(`DNS Query sent to ${server}:${DNS_PORT}`)
    }
  })

  client.on('message', (message) => {
    const response = parseResponse(message)
    processDNSResponse(response)

    client.close()
  })

  client.on('error', (err) => {
    console.error(`Client error: ${err.message}`)
    client.close()
  })

  client.on('timeout', () => {
    console.log('Request timed out')
    client.close()
  })
}

/**
 * Processes the DNS response to extract relevant DNS records.
 *
 * This function processes the DNS response, first checking for NS (Name Server) records
 * in the authority section. If an NS record is found, it attempts to find the corresponding
 * IP address in the additional section and sends a new DNS query to that IP address. If no
 * NS records are found, it extracts the IP address from the answer section and logs it.
 *
 * @param {object} response - The parsed DNS response object from `parseResponse`.
 */
function processDNSResponse(response: ReturnType<typeof parseResponse>) {
  const nsRecords = response.authorityRecords.filter(
    (rec) => rec.type === NS_RECORD_TYPE
  )

  if (nsRecords.length > 0) {
    const nsRecord = nsRecords[0] as DNSRecord // one NS Record is sufficient to get the IP of the domain, this way we do less queries
    const nsIP = response.additionalRecords.find(
      (rec) => rec.domainName === nsRecord.rdata
    )?.rdata

    if (nsIP) {
      queryDNS(DOMAIN_TO_RESOLVE, nsIP)
    }
  } else {
    const answerRecord = response.answerRecords[0] as DNSRecord
    console.log('IP Address found: ', answerRecord.rdata)
  }
}

// Start the DNS resolution process by querying the root DNS server.
queryDNS(DOMAIN_TO_RESOLVE, ROOT_DNS_SERVER)
