# DNS Query Resolver

This project is a simple DNS resolver written in TypeScript. It sends a DNS query to a specified DNS server, processes the response, and extracts useful information such as the resolved IP address for a domain name. The resolver handles both IPv4 and IPv6 addresses and supports recursive DNS queries by following NS (Name Server) records.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Detailed Explanation](#detailed-explanation)
  - [DNS Record Interface](#dns-record-interface)
  - [Constants](#constants)
  - [Main Functions](#main-functions)
    - [queryDNS](#querydns)
    - [processDNSResponse](#processdnsresponse)
  - [Helper Functions](#helper-functions)
    - [parseResponse](#parseresponse)
    - [parseRecord](#parserecord)
    - [parseSections](#parsesections)
    - [parseQuestionSection](#parsequestionsection)
    - [parseHeader](#parseheader)
    - [isResponse](#isresponse)
    - [parseDomainName](#parsedomainname)
    - [interpretRDataARecord](#interpretrdataarecord)
    - [encodeDomainName](#encodedomainname)
    - [createDNSQuery](#creatednsquery)
    - [generateIdentifier](#generateidentifier)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The DNS Query Resolver project is a basic implementation of a DNS client. It is capable of sending DNS queries to a DNS server and interpreting the responses. The project demonstrates how DNS resolution works at a low level, including handling compressed domain names and interpreting various DNS record types.

## Features

- Sends DNS queries to specified DNS servers.
- Supports both IPv4 (`A` record) and IPv6 (`AAAA` record) queries.
- Handles DNS response parsing, including handling compressed domain names and following NS records.
- Recursive DNS querying by resolving the IP address of intermediate DNS servers.

## Installation

To run this project, you'll need to have Node.js installed. Follow the steps below to get started:

1. Clone the repository:
   ```bash
   git clone https://github.com/avdemchenko/dns-resolver.git
   ```
2. Navigate to the project directory:
   ```bash
   cd dns-query-resolver
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

To resolve a domain name, simply run the project using Node.js:

```bash
npm run start
```

This will resolve the domain name `www.google.com` using the root DNS server.

## Project Structure

- **`index.ts`**: Entry point of the application. It contains the main DNS query logic and response handling.
- **`dns.ts`**: Contains helper functions for creating DNS queries, parsing responses, and interpreting DNS records.

## Detailed Explanation

### DNS Record Interface

The `DNSRecord` interface defines the structure of a DNS resource record:

```typescript
export interface DNSRecord {
  domainName: string
  type: number
  rdata: string
  offset: number
}
```

### Constants

- **`ROOT_DNS_SERVER`**: IP address of the root DNS server (`198.41.0.4`).
- **`DNS_PORT`**: Port number used for DNS queries (`53`).
- **`A_RECORD_TYPE`**: DNS record type for IPv4 addresses (`1`).
- **`AAAA_RECORD_TYPE`**: DNS record type for IPv6 addresses (`28`).
- **`NS_RECORD_TYPE`**: DNS record type for name servers (`2`).
- **`DOMAIN_TO_RESOLVE`**: The domain name to resolve (`www.google.com`).

### Main Functions

#### queryDNS

Sends a DNS query to a specified server and processes the response.

```typescript
function queryDNS(domain: string, server: string) {
  // Function implementation
}
```

- **Parameters**:
  - `domain`: The domain name to resolve.
  - `server`: The IP address of the DNS server.
- **Functionality**:
  - Determines the IP version of the server.
  - Creates a UDP client socket and sends a DNS query.
  - Listens for the DNS response and processes it using `processDNSResponse`.

#### processDNSResponse

Processes the DNS response, extracting the necessary DNS records.

```typescript
function processDNSResponse(response: ReturnType<typeof parseResponse>) {
  // Function implementation
}
```

- **Parameters**:
  - `response`: The parsed DNS response object.
- **Functionality**:
  - Filters NS records from the authority section.
  - Recursively queries the next DNS server if an NS record is found.
  - Logs the resolved IP address if found in the answer section.

### Helper Functions

#### parseResponse

Parses the DNS response buffer and extracts the header, question, and resource records.

```typescript
function parseResponse(buffer: Buffer) {
  // Function implementation
}
```

#### parseRecord

Parses a single DNS resource record from the buffer.

```typescript
function parseRecord(buffer: Buffer, offset: number): DNSRecord {
  // Function implementation
}
```

#### parseSections

Parses multiple DNS resource records in a section (answer, authority, or additional).

```typescript
function parseSections(buffer: Buffer, count: number, startOffset: number) {
  // Function implementation
}
```

#### parseQuestionSection

Parses the question section of the DNS message.

```typescript
function parseQuestionSection(buffer: Buffer, offset: number) {
  // Function implementation
}
```

#### parseHeader

Parses the DNS header from the buffer.

```typescript
function parseHeader(buffer: Buffer): Header {
  // Function implementation
}
```

#### isResponse

Checks if the buffer represents a DNS response message.

```typescript
function isResponse(buffer: Buffer) {
  // Function implementation
}
```

#### parseDomainName

Parses a domain name from the DNS message buffer, handling possible compression.

```typescript
function parseDomainName(buffer: Buffer, offset: number) {
  // Function implementation
}
```

#### interpretRDataARecord

Interprets the RDATA of a DNS record for `A` and `AAAA` record types.

```typescript
function interpretRDataARecord({
  rdata,
  type,
}: {
  rdata: Buffer
  type: Exclude<DNSType, typeof NS_RECORD_TYPE>
}) {
  // Function implementation
}
```

#### encodeDomainName

Encodes a domain name into the DNS wire format.

```typescript
function encodeDomainName(domain: string) {
  // Function implementation
}
```

#### createDNSQuery

Creates a DNS query packet for the specified domain.

```typescript
function createDNSQuery(domain: string) {
  // Function implementation
}
```

#### generateIdentifier

Generates a random 16-bit identifier for DNS queries.

```typescript
function generateIdentifier() {
  // Function implementation
}
```
