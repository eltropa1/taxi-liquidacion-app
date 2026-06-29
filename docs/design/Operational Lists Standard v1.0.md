# Operational Lists Standard v1.0

## Status

Approved.

This document defines the official design standard for operational lists in TaxiGeo.

The Trip History V2 is the first implementation of this standard, but the standard is not limited to trip history.

---

## Mission

Operational lists must allow the user to recognize, scan, and act on daily work items with the minimum possible visual effort.

The goal is not decoration.

The goal is speed, clarity, density, and professional daily use.

---

## Scope

This standard applies to operational lists such as:

- trip history;
- expenses;
- maintenance records;
- incidents;
- alerts;
- future operational entities.

It does not apply automatically to dashboards, reports, statistics, forms, or detail screens.

---

## Core idea

An operational list is not designed primarily for reading.

It is designed for recognition.

The user should be able to identify the meaning of an item before finishing reading the text.

---

## Principles

### 1. One row equals one entity

Each row represents exactly one operational item.

For Trip History V2:

- one row equals one trip.

Future lists must preserve the same principle.

---

### 2. One row should fit in one visual line

Operational rows must be compact.

The preferred layout is a single-line row.

Additional lines are allowed only when the entity cannot be represented safely or clearly in one line.

Multi-line layouts must be justified.

---

### 3. Density has priority over decoration

Operational lists are working tools.

They must show as many useful items as possible without sacrificing legibility.

Decorative space should be removed.

Every pixel must justify its existence.

---

### 4. Recognition has priority over reading

The user should not need to read every word to understand the item.

Visual channels must help recognition.

Color, iconography, position, and typography must reduce cognitive load.

---

### 5. Accessibility has priority over minimalism

Colors must be clearly distinguishable.

Text must remain readable.

The interface must be comfortable for users who work many hours and for users with lower visual acuity.

A minimal design is not acceptable if it forces the user to focus too much to distinguish information.

---

### 6. Primary information must never be sacrificed for secondary information

If space is limited, secondary information must be removed, shortened, or moved elsewhere.

Primary information must remain visible.

For trip rows, the amount must never be truncated.

---

### 7. Detail belongs to detail screens

Operational lists are not detail screens.

They must not try to show all available information.

Their purpose is to identify the item and allow fast action.

Secondary information belongs in the detail or edit screen.

---

## Interaction standard

Each operational row should be fully tappable.

The row itself is the interaction target.

Avoid independent edit buttons inside the row unless there is a strong product reason.

For Trip History V2:

- tapping the row opens trip editing;
- no separate edit button is required;
- the chevron indicates navigability.

---

## Visual channel rules

Each visual channel must communicate one meaning only.

A channel must not be reused for multiple meanings inside the same list.

For Trip History V2:

| Visual channel | Meaning |
|---|---|
| Row background color | Platform |
| Main icon | Service type |
| Platform mark | Platform |
| Payment icon | Payment method |
| Text | Time and operational data |
| Amount | Economic result |
| Chevron | Navigability |

These meanings must not be mixed.

---

## Trip History V2 row structure

The approved order for Trip History V2 is:

1. service type icon, when available;
2. platform mark;
3. payment method icon;
4. start time → end time;
5. flexible space;
6. amount;
7. chevron.

If the service type is not available, the service type slot must be hidden.

Do not invent data.

---

## Information allowed in Trip History V2

Trip History V2 may show:

- service type icon, when available;
- platform identity;
- payment method;
- start time;
- end time;
- amount;
- navigation affordance.

---

## Information not allowed in Trip History V2 rows

Trip History V2 rows must not show:

- origin;
- destination;
- long description;
- duration;
- notes;
- statistics;
- secondary comments;
- operational details that belong to the trip detail screen.

This information belongs in the detail or edit screen.

---

## Density target

Operational lists should maximize the number of complete items visible on screen.

For Trip History V2, the practical target is to show approximately seven to eight complete trips on a medium Android phone when the surrounding screen layout allows it.

This is not a rigid number.

It is a density benchmark.

Legibility must not be sacrificed only to reach the number.

---

## Color standard

When color is used as an identity channel, it must have enough presence to be recognized immediately.

Colors must not be so soft that the user has to focus carefully to distinguish them.

Colors must not be so saturated that they reduce text readability.

For Trip History V2:

- the row background color identifies the platform;
- the color must come from the Visual Domain;
- the UI must not calculate, mix, or invent colors.

---

## Architecture relationship

Operational lists must respect TaxiGeo architecture.

UI components render.

They do not decide visual identity.

Reusable presentation models must live in Presentation.

Visual identity must come from the Visual Domain.

For Trip History V2:

- `TripVisualProjection` prepares the row data;
- `TripHistory` renders the projection;
- `VisualCatalog` provides visual identity;
- `PlatformIdentity.surfaceColor` provides row background;
- `PlatformIdentity.onSurfaceColor` provides readable foreground.

---

## Presentation rule

Presentation is a projection layer.

It is not a decision layer.

Presentation may prepare data for UI.

Presentation must not:

- decide business rules;
- decide visual identity;
- calculate colors;
- choose icons independently;
- access persistence;
- use React components;
- use hooks;
- hold UI state.

---

## Future changes

Any future change to an operational list must justify that it improves at least one of the following:

- recognition speed;
- density;
- legibility;
- accessibility;
- consistency;
- operational usefulness.

Changes that only add decoration should be rejected.

---

## Final rule

Operational lists are professional work surfaces.

They must help the user act faster with less effort.

If a visual element does not improve recognition, action, clarity, or accessibility, it should not be there.
