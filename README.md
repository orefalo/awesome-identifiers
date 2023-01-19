# Globally Unique Identifier Comparison

The idea behind this project is to share the little I learned about GIUD implementations and provide education to others.

*Disclaimer: Although I carry good security foundations, I do not consider myself a cryptography expert, please take this data with a grain of salt and build your own opinions.*

## Why do you need a GUID?

GUID (Globally Unique Identifier) are generators for identifiers typically used as primary keys in databases. GUID solve problems typically inherent to three tiers architectures, more precisely:

1. **Scalability** - growing hardware vertically has its limits, soon or later multiple instances are required to sustain the load. Centralized id generators have a significant (negative) impact on performance. GUID typically allow distributing generators across multiple instances.
2. **Resilience** - the ability to run multiple instances of a generator is a great way to improve its availabliity and avoid a single point of failure.
3. **Security** - sequences are trivial to predict, in a distributed world different sources of entropy are used to guarantee uniqueness via a random, difficult to predict (long) string.

## How are GUID different from DB SEQUENCES?

*Sequences is a RDBMS centric solution to ease primary key generation.*

|                          |                            DB SEQ                            |                             GUID                             |
| ------------------------ | :----------------------------------------------------------: | :----------------------------------------------------------: |
| **Bit length**           |                        32 or 64 bits                         |                     typically 128+ bits                      |
| **Format**               |                            number                            | Strings, with the exception of UUID, which has native binary support in many databases |
| **Compute load**         | Trivial +1 but typically runs a single instance or requires coordination | distributed generation & complex: can require IO, random sources and hash calculations, coordination. |
| **Collisions detection** | Trivial and predictable: a database sequence collisions once it overflows |                    Much harder to predict                    |
| **Indexing at rest**     | trivial: B-TREE indexes were engineered with sequences in mind | Opaque GUID typically performs poorly as database indexes due to their randomness. Time based GUID encode the date as part of the id to get around this limitation. |



## What are the categories of GUID?

There are mainly two categories of GUIDs: **Opaque** and **time-based**. Time based GUID trade a few bits of entropy to encode a date, they are therefore more efficient to index at the cost of a shorter randomness range.

|                 | Guess Protection                     | Indexing at REST | Implementations           |
| --------------- | ------------------------------------ | ---------------- | ------------------------- |
| Opaque GUID     | hard                                 | poor             | ie. Nanoid, CUID2, UUIDv4 |
| Time-based GUID | Leaks dates for a shorter randomness | good             | ie. ULID, KSUID, UUIDv7   |

## Features, Benefits & Shortcomings

The table below provides a comprehensive comparison between the major GUID implementations.

*Please click on the image to browse an editable version*

![comparison table screenshot](screen.png "https://docs.google.com/spreadsheets/d/1ZsXBH0z7GOJv3N69QbEDKBZt8IeE0CfRI9vhihV4teo/edit?usp=sharing")

## Benchmark

*Disclaimer, these benchmark are performed against a given *architecture* (JS/Arm), different implementations/runtimes will likely give different results.*

```
Platform info:
==============
   Darwin 22.2.0 arm64
   Node.JS: 18.12.1
   V8: 10.2.154.15-node.12
   CPU: Apple M1 Pro × 8
   Memory: 16 GB

Running "GUID Benchmark" suite...
Progress: 100%

  uuid v1:
    4 460 889 ops/s, ±0.57%    | 63.99% slower

  uuid v4:
    8 870 032 ops/s, ±0.54%    | 28.41% slower

  uuid v7:
    443 205 ops/s, ±0.82%      | 96.42% slower

  nanoid:
    5 300 343 ops/s, ±0.48%    | 57.22% slower

  cuid:
    347 037 ops/s, ±1.15%      | 97.2% slower

  cuid2:
    60 490 ops/s, ±0.52%       | slowest, 99.51% slower

  ulid (monotonic):
    12 389 427 ops/s, ±0.64%   | fastest

  xid:
    3 417 174 ops/s, ±0.41%    | 72.42% slower

  ksuid:
    532 223 ops/s, ±1.02%      | 95.7% slower

Finished 9 cases!
  Fastest: ulid (monotonic)
  Slowest: cuid2
```

![benchmark](benchmark.png)



## Thoughts beyond theory

*At this point you should have a pretty good idea of the implementations out there and how they compare.* Let us put things in context.


### Are CSPRNG implementation broken?

Some are, but mostly in (old) browsers... and that's a really good news, because ID generation typically takes place **Server side**, where implementations are stable and uniform.

### Is Randomness a pledge for security ?

Machines run algorithms that approximate randomness by selecting algorithms and trusted entropy sources. A cryptographically secure pseudo-random number generator (CSPRNG) is a algorithm with properties that make it suitable for use in cryptography. On Linux for instance, the kernel gathers noisy data from various devices and transfers them to an internal pool of entropy.

Unfortunate, not all cryptography stacks are equal. For instance, old versions of CSPRNG are famous for their poor implementations in JavaScript or PHP. Algorithms such as SHA1 also proved to be unsecured but are still used today in some GUID generators.

While ensuring that a GUID generator is cryptography certified is important, **an ID generator is nothing in view of a proper security architecture.**

### What are the odds for collisions ?

The answer depends on the use case and the specifics of a GUID implementation

With that said, the advertised Math is probably not a good reflection of reality: In an application, a GUID is used to create a multitude of different entities. These entities by definition do not overlap with one another and are therefore in their own *space*, further reducing the chances of collisions.

### Is there a risk to leak the id generation date ?

It all depends on *requirements*.

**From a legal standpoint**, some will argue that the ID generation date is PII data. While this classification could not be validated, a lawyer friend of mine found the argument difficult to defend in a court without considering the complete security architecture.

**From a security standpoint**, it depends on your use case, but very unlikely. Zendesk recently wrote [an article on the topic](https://zendesk.engineering/how-probable-are-collisions-with-ulids-monotonic-option-d604d3ed2de), recommended.

## Definitions

*This section helps clarify some of the terms we used in this document.*

### Collisions

A hash collision is a random match in hash values that occurs when a hashing algorithm produces the same hash value for two distinct pieces of data.

### Coordination

The communication between the different elements of a complex activity so as to enable them to work together effectively.

### Entropy

In Cryptography, refers to the randomness collected by a system for use in algorithms that require random seeds. (jargon word for "randomness")

### Monotonic

A monotonic generator ensures ids are always sorted in order. This term is particularly relevant to date based guid generators which are based on time. For a given instance, at instant T, the next id should always be sorted.

### Opaque

An opaque identifier is one that doesn't expose its inner details or structure.

### Pagination

Pagination is a process that is used to divide a large data into smaller discrete pages. Commonly used in customer facing applications, pagination requires the notion of pointers on the dataset.

### Predictable

A random number generator is predictable if, after observing some of its “random” output, we can make accurate predictions about what “random values” are coming up next.

### Randomness

Randomness (entropy) is the cornerstone of cryptography. The more random the numbers, the more secure the cryptographic system. The challenge then, becomes one of generating true randomness.


## Contribute

Feel free to fork this repo and adjust the table content on google sheet.
Contribution and discussions are welcome!

