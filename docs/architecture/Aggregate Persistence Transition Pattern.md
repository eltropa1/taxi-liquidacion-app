# Aggregate Persistence Transition Pattern

## Estado

Historical.

Superseded by the official TaxiGeo 1.0 architecture.

This document is retained only as a record of an abandoned transitional hypothesis.

It does not have normative value.

---

## Current rule

The official architecture now defines that:

- `Trip` and `Workday` are the core persistent aggregates;
- Domain is the source of truth for business meaning;
- Application coordinates through ports;
- Infrastructure implements persistence and technical adapters;
- no document may claim that an aggregate becomes valid only after persistence emits its identity.

---

## Why this document is no longer normative

The transitional pattern it described was useful only while the prototype-era thinking was being replaced.

That transition is complete.

TaxiGeo 1.0 must follow the approved normative documentation instead of this historical hypothesis.

