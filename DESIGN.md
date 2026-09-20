---
name: NarcoSense
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bcc9c6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#879391'
  outline-variant: '#3d4947'
  surface-tint: '#6bd8cb'
  primary: '#6bd8cb'
  on-primary: '#003732'
  primary-container: '#29a195'
  on-primary-container: '#00302b'
  inverse-primary: '#006a61'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#ff5451'
  on-tertiary-container: '#5c0008'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
  telemetry-display:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  telemetry-display-mobile:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies a rugged, mission-critical aesthetic tailored for field officers, border patrol agents, and forensic inspection teams operating in high-stakes, unpredictable environments. The UI merges military-grade tactical utility with modern digital instrumentation.

### Personality & Emotional Tenor
- **Absolute Decisiveness:** Zero ambiguity; readouts and substance identification statuses must be immediately decipherable under high glare, rain, or low-light tactical settings.
- **Rugged Durability:** The interface feels engineered, physical, and rock-solid—built to match the reinforced chassis of a handheld field scanner.
- **Clinical Precision:** Telemetry, Raman/spectrometry readouts, and purity metrics feel scientific, authoritative, and tamper-evident.

### Design Movement: Tactical Instrumentalism
Drawing inspiration from avionics displays, military heads-up consoles, and specialized laboratory hardware:
- **Deep Carbon Foundation:** Pure optical black and ultra-deep carbon slate prevent eye fatigue while preserving night vision adaptations.
- **High-Acuity Visual Hierarchy:** Monochromatic utility chrome contrasted against saturated, unambiguous operational status signals (Teal for nominal operation, Emerald for safe clearance, Amber for precursor/caution, Crimson for illicit match/hazardous threat).
- **Glove-Optimized Target Ergonomics:** Generously spaced touch matrices and deliberate confirmation flows engineered for gloved interaction in inclement weather.

## Colors

The palette is engineered specifically for OLED/high-brightness sunlight-readable handheld panels. True dark backdrops reduce battery drain in the field while providing extreme chromatic separation for optical readouts.

### Core Functional Palette
- **Base Neutral Surface (`#0F172A` Slate Carbon):** The master ambient plane. Layered against `#020617` (Deep Obsidian for system gutters and recessed slots) and `#1E293B` (Elevated Instrument Pods).
- **Primary Operational (`#0D9488` Tactical Teal):** Signifies system readiness, laser calibration, active scanning, and primary user progression.
- **Secondary Alert (`#F59E0B` Alert Amber):** Signals low reagent levels, ambiguous spectra matches, trace precursor hits, and environmental warnings.
- **Danger / Critical (`#EF4444` Threat Crimson):** Reserved exclusively for positive illicit compound matches, biohazard warnings, toxic fentanyl/carfentanil thresholds, and fail states.
- **Verification / Safe (`#10B981` Nominal Emerald):** Clean baseline clearance, authenticated chain-of-custody signatures, and completed diagnostics.

### Text & Telemetry Chromatics
- **Text Primary (`#F8FAFC` Ultra-Crisp Cold White):** 100% opacity for critical values, compound nomenclature, and operational alerts.
- **Text Secondary (`#94A3B8` Slate Fog):** For persistent telemetry metrics, engineering units (nm, %, ppm), and field metadata.
- **Text Disabled / Locked (`#475569` Armor Grey):** For inactive sensor arrays and past scan traces.
- **Structural Keylines (`#334155` Cold Anodized Steel):** High-definition, low-scatter containment borders providing structural boundaries between data cells.

## Typography

Typography prioritizes rapid recognition and immediate legibility under sub-optimal operational conditions.

### Font Hierarchy Roles
- **Headlines (`Space Grotesk`):** Delivers an authoritative, engineered character for chemical classification, screen identification, and threat verdicts. The geometric cuts preserve distinct letterforms at high glance velocity.
- **Body (`Inter`):** Selected for maximum neutral legibility in chain-of-custody notes, procedural guidance, legal warnings, and multi-line sample descriptions.
- **Labels & Telemetry (`JetBrains Mono`):** Dedicated to all numerical values, wavelengths, spectrometer sensor outputs, GPS coordinates, timestamps, confidence percentages, and PIN authorization keypads. Tabular lining numbers prevent layout jitter during real-time telemetry streaming.

### Legibility Rules
- Numerical telemetry readouts must always employ uppercase suffixes (e.g., `87.4% CONF`, `1064 NM`, `0.042 MG/ML`).
- Labels on telemetry metrics use uppercase styling with tracking expanded to `0.06em` - `0.08em` for rapid legibility under screen glare.

## Layout & Spacing

Field testing handhelds balance information density against physical touchscreen usability. The layout model ensures that all primary touch actions reside within immediate thumb sweep areas while telemetry arrays remain unoccluded.

### Screen Partitioning & Ergonomics
- **Command Deck (Top):** 48px fixed zone displaying device connectivity, tamper status, battery reserve, laser arm state, and GPS lock.
- **Telemetry Canvas (Center):** Modular, structured grid hosting dynamic spectral readouts, scan histograms, and substance identification cards.
- **Action Shelf (Bottom):** 80px dedicated interaction region anchored to the bottom bezel for primary test triggers, emergency purge controls, or confirmation steps.

### Responsive Hardware Breakpoints
- **Compact Handheld Viewport (360px - 480px):** Single-column stacked telemetry pod layout. All interactive touch targets must meet a strict minimum size of 48x48px (ideally 56x56px) to allow operation with heavy tactical nitrile or cut-resistant gloves.
- **Docked / Tablet Viewport (768px - 1024px):** 2-column split configuration; left partition retains live spectrometer visualizer, right partition hosts chemical database matches, compound breakdown, and evidentiary logging.

## Elevation & Depth

Depth in this design system is physical and structural rather than soft and decorative. Ambient shadows are stripped out to eliminate visual mud on outdoor-rated displays.

### Layer Tiers & Contrast Boundaries
- **Recessed Level (Base Plate `#020617`):** Represents background data wells, non-interactive visualizer viewports, and recessed scan docks. Inset borders (`1px solid #1E293B`) convey physical depth.
- **Deck Level (Standard Surface `#0F172A`):** The primary chassis plane carrying routine data modules, telemetry logs, and form fields.
- **Instrument Pod Level (`#1E293B`):** Raised interactive containers, test cards, and live readouts. Outlined with a high-definition 1px keyline in `#334155`.
- **Active Warning / Critical Overlay Tier:** Floating notification dialogs and mission-critical confirmation prompts carry a 2px high-visibility outline using either `#EF4444` or `#F59E0B` alongside a solid `#090D16` backing to completely block underlying data noise.

## Shapes

The physical casing of a mission-critical tool is angular, reinforced, and machined. The UI geometry directly reflects this rugged philosophy with tight, controlled cornering.

### Corner Radii Architecture
- Corner radius is kept strictly at `0.25rem` (4px) for data pods, buttons, inputs, and list items to communicate structural rigidity.
- Status banners and continuous scan bars utilize hard, unrounded edges (`0px`) to align seamlessly against hardware screen bezels.
- PIN key buttons and telemetry badges use subtle 4px corner radii with chamfered visual cues in tactical iconography.

## Components

### Buttons & Tactical Triggers
- **Primary Scan Trigger:** Full-width or oversized minimum 56px height block. Solid tactical teal background (`#0D9488`), dark obsidian text (`#020617`) in `Space Grotesk` Bold. Active state transitions to bright cyan-teal glow with high-contrast reverse borders.
- **Hazard / Purge Action:** Solid crimson background (`#EF4444`) with white text (`#FFFFFF`). Protected by continuous press-and-hold interaction timers (minimum 1.5-second hold) to eliminate accidental discharge during critical field procedures.
- **Secondary Actions:** High-contrast outlined buttons (`1.5px solid #475569`) with cold white text on `#1E293B` surfaces.

### Telemetry Pods & Data Readouts
- Rigid modular boxes bound by `1px solid #334155`.
- Top sub-row features micro-label (`label-sm`, JetBrains Mono, `#94A3B8`).
- Bottom main-row features large digital readout (`telemetry-display`, JetBrains Mono, `#F8FAFC`).
- Real-time confidence ratings display an inline mini bar with color steps (0–70% Amber, 71–100% Emerald).

### Prominent Status Banners
- Edge-to-edge system notifications fixed below the system header.
- **Match Confirmed:** High-contrast solid Threat Crimson (`#EF4444`) banner with pulsating beacon indicator, large uppercase chemical match title (e.g., `POSITIVE: FENTANYL HCL`), and confidence grade (`99.4% MATCH`).
- **Clearance Nominal:** Deep emerald background (`#064E3B`) with emerald edge keyline (`#10B981`) and white confirmation text.
- **Laser Radiation Active:** Alternating high-visibility amber/black warning striping along the screen perimeter when the Raman laser aperture is energized.

### PIN Pad & Operator Authentication
- 3x4 symmetrical numeric matrix optimized for thumbs.
- Individual key size: 68px height, separated by `space-sm` (8px).
- Surface: `#1E293B` resting, `#334155` pressed.
- Font: JetBrains Mono at 24px with high tactile feedback (haptic pulse + high-contrast visual key illumination).

### Inputs & Toggles
- **Form Fields:** Dark recessed surface (`#020617`) with cold anodized border (`#334155`). Active focus state shifts to a 2px Tactical Teal border (`#0D9488`).
- **Checkboxes & Toggles:** Square 24x24px targets with thick 2px checkmarks; toggle switches use solid, rectangular sliding slugs with unambiguous dual-state labels (`ARMED` / `SAFE`) embedded directly within the track.