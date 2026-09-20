# NarcoSense: UI/UX Brief (Demo Web App)
**Draft v0.1 · 20 Sept 2026 · Companion to the Demo Flow PRD · Source design system: DESIGN.md ("Tactical Instrumentalism")**

---

## 1. Purpose

This brief turns the NarcoSense design system into concrete screen designs for the four-step demo flow:

**Page 1** Confirm input taken (standalone) → **Page 2** Camera capture → **Page 3** PIN → **Page 4** Results

The interface should feel like a rugged field instrument: decisive, glove-friendly, readable in glare, and never ambiguous about what the verdict is.

## 2. Design principles

1. **Decisive.** The verdict (Legal / Illegal) is the loudest element on the results screen. No one should have to read small text to know it.
2. **Nothing leaks.** Pages 1 to 3 are visually neutral. No result, image or substance name appears before the PIN is accepted.
3. **Glove-first.** Every touch target is at least 48×48 px, ideally 56 px. Confirmation steps are deliberate, not tap-happy.
4. **Honest about the demo.** A permanent DEMO / SIMULATED marker is always on screen. The interface never shows hardware statuses that are not real.
5. **Structural, not decorative.** No shadows or soft blurs. Depth comes from tone steps and 1 px keylines.

## 3. What we take from DESIGN.md and what we drop

| Keep | Drop or change for this build |
|---|---|
| Three-zone layout: Command Deck (48 px), Telemetry Canvas, Action Shelf (80 px) | Laser-armed state, tamper status and Raman/spectrometer visuals. The device is a gas-sensor array, so these would be fake. |
| Dark carbon palette with four status colors | The "POSITIVE: FENTANYL HCL, 99.4% MATCH" style banner. Replace with substance pattern plus a **confidence range** (per the PRD). |
| Space Grotesk / Inter / JetBrains Mono roles | Amber/black perimeter striping (reserved for laser). Not used. |
| 3×4 PIN pad, 68 px keys | Chemical-database and evidentiary-log panels. Not in the demo scope. |
| Deliberate confirmation flows, hard-edged banners, 4 px radii | GPS lock, battery and connectivity chips unless they are real values. |

**Palette note.** DESIGN.md contains two palettes: a Material-style token block in the frontmatter (surface `#0B1326`, primary `#6BD8CB`) and a more detailed prose palette (base `#0F172A`, teal `#0D9488`). This brief uses the **prose palette** because it defines every component. See Open Questions.

## 4. Design tokens

### Colors

| Role | Token | Hex | Use |
|---|---|---|---|
| Recessed base | `--bg-recessed` | `#020617` | Camera viewport, inputs, data wells |
| Deck surface | `--bg-deck` | `#0F172A` | Page background |
| Instrument pod | `--bg-pod` | `#1E293B` | Cards, keys (resting), readouts |
| Keyline | `--keyline` | `#334155` | 1 px borders, pressed key |
| Overlay backing | `--bg-overlay` | `#090D16` | Dialogs |
| Operational | `--teal` | `#0D9488` | Primary actions, focus, progress |
| Caution | `--amber` | `#F59E0B` | DEMO chip, warnings, low-confidence part of range bar |
| Threat | `--crimson` | `#EF4444` | Illegal verdict, wrong-PIN and fail states only |
| Nominal | `--emerald` | `#10B981` | Legal verdict, high-confidence part of range bar |
| Emerald deep | `--emerald-deep` | `#064E3B` | Legal banner background |
| Text primary | `--text` | `#F8FAFC` | Values, titles |
| Text secondary | `--text-2` | `#94A3B8` | Labels, units, metadata |
| Text disabled | `--text-off` | `#475569` | Inactive items, secondary button border |

### Typography

| Style | Font | Size / line | Weight | Used for |
|---|---|---|---|---|
| headline-lg | Space Grotesk | 26 / 32 | 700 | Screen titles, verdict banner title |
| headline-md | Space Grotesk | 20 / 26 | 600 | Pod titles, dialog titles |
| body-lg | Inter | 17 / 24 | 500 | Instructions |
| body-md | Inter | 15 / 22 | 400 | Supporting text |
| body-sm | Inter | 13 / 18 | 400 | Demo disclaimer, hints |
| label-lg | JetBrains Mono | 16 / 20 | 600 | Button text, banner confidence |
| label-sm | JetBrains Mono | 11 / 14 | 500 | Pod micro-labels (uppercase, tracking 0.08em) |
| telemetry-display (mobile) | JetBrains Mono | 32 / 36 | 700 | Confidence range, PIN digits, timers |

**Rules:** all numbers are set in JetBrains Mono. Numeric readouts use uppercase suffixes (`65–80% CONF`). Micro-labels are uppercase with expanded tracking.

### Spacing and shape

- Gutter 12 px (mobile) / 16 px; page margin 16 px (mobile) / 24 px; component gaps 4 / 8 / 14 / 20 / 32 px.
- Radius: 4 px for pods, buttons, inputs and keys. **0 px** for edge-to-edge banners.
- Elevation: none. Use tone steps and 1 px `--keyline` borders. Dialogs get a 2 px amber or crimson outline on `--bg-overlay`.

## 5. Layout frame

```
┌────────────────────────────────┐
│ COMMAND DECK        48 px fixed│
├────────────────────────────────┤
│                                │
│ TELEMETRY CANVAS               │
│ (scrolls if needed)            │
│                                │
├────────────────────────────────┤
│ ACTION SHELF        80 px fixed│
└────────────────────────────────┘
```

- **Compact handheld (360–480 px):** single column, stacked pods. Primary actions sit in the Action Shelf, inside thumb reach.
- **Tablet (768–1024 px):** two columns. Applies to Page 4 only (see 6.4); Pages 1 to 3 stay a centered single column with a max width of 480 px.

## 6. Screen specifications

### 6.1 Page 1: Confirm input taken (standalone)

**Goal:** the operator confirms the input was taken. One decision, no distractions.

**Isolation rule:** this page has its **own minimal top bar and its own styles**. It does not use the shared Command Deck component and contains no navigation, inspector name, result, image or sensor data.

```
┌────────────────────────────────┐
│ NARCOSENSE            ● DEMO   │ 48 px
├────────────────────────────────┤
│ STEP 1 / 4                     │
│                                │
│ CONFIRM SAMPLE INPUT           │
│ Confirm that the breath sample │
│ has been taken before          │
│ continuing.                    │
│                                │
│ ┌──────────────┐┌────────────┐ │
│ │ SESSION      ││ TIME       │ │
│ │ NEW          ││ 14:32:08   │ │
│ └──────────────┘└────────────┘ │
├────────────────────────────────┤
│ [   CONFIRM: INPUT TAKEN   ]   │ 80 px
└────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Top bar | Wordmark "NARCOSENSE" (Space Grotesk 700) left; amber **DEMO** chip right |
| Step label | `STEP 1 / 4`, label-sm, `--text-2` |
| Title | headline-lg, uppercase, `--text` |
| Body | body-lg, `--text-2` |
| Pods | Two pods, `--bg-pod`, 1 px keyline. Micro-label above, telemetry value below (`SESSION: NEW`, live clock) |
| Primary button | Full width, 56 px minimum height, `--teal` fill, `#020617` text, Space Grotesk 700 |

**States**

| State | Behavior |
|---|---|
| Default | Button enabled |
| Pressed | Bright cyan-teal glow and light reverse border |
| Submitted | Button disables and label changes to `SESSION STARTED`; navigates to Page 2 after about 400 ms |
| Storage error | Amber dialog: `CANNOT START SESSION`, with a `RETRY` button |

### 6.2 Page 2: Camera capture

**Goal:** capture a clear photo and store it. Nothing is shown from earlier steps.

```
┌────────────────────────────────┐
│ NARCOSENSE   STEP 2/4  ● DEMO  │
├────────────────────────────────┤
│ ┌────────────────────────────┐ │
│ │ ┌                        ┐ │ │
│ │                            │ │
│ │       LIVE PREVIEW         │ │
│ │                            │ │
│ │ └                        ┘ │ │
│ └────────────────────────────┘ │
│ ALIGN SUBJECT WITHIN FRAME     │
├────────────────────────────────┤
│ [ FLIP ]  [     CAPTURE     ]  │
└────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Command deck | Wordmark, `STEP 2 / 4`, DEMO chip, short test ID (for example `#A1042`) |
| Viewport | `--bg-recessed` well with an inset `#1E293B` border. Corner brackets in `--teal` as a framing guide |
| Hint | body-sm, uppercase label style, `--text-2` |
| Capture | Primary teal button, 56 px, label `CAPTURE` |
| Flip | Secondary outlined button (1.5 px `--text-off`), switches front/rear camera |

**Review mode (after capture)**

- The still fills the viewport with a timestamp overlay (JetBrains Mono, label-sm).
- Action Shelf swaps to `RETAKE` (secondary) and `USE PHOTO` (primary teal).
- The photo is stored on `USE PHOTO`, then navigate to Page 3.

**States**

| State | Behavior |
|---|---|
| Requesting permission | Recessed viewport with `REQUESTING CAMERA…` |
| Permission denied | Amber-outlined dialog: `CAMERA BLOCKED`, primary `OPEN CAMERA (FILE)` as fallback |
| Saving | `USE PHOTO` shows `SAVING…` and disables |
| Save failed | Crimson-outlined dialog: `IMAGE NOT SAVED`, with `RETRY` |

### 6.3 Page 3: PIN screen

**Goal:** authenticate quickly with gloves. The screen reveals nothing about the test.

```
┌────────────────────────────────┐
│ NARCOSENSE   STEP 3/4  ● DEMO  │
├────────────────────────────────┤
│ INSPECTOR ACCESS               │
│ ENTER PIN                      │
│                                │
│     [ • ] [ • ] [   ] [   ]    │
│   3 ATTEMPTS REMAINING         │
│                                │
│   [ 1 ]  [ 2 ]  [ 3 ]          │
│   [ 4 ]  [ 5 ]  [ 6 ]          │
│   [ 7 ]  [ 8 ]  [ 9 ]          │
│   [CLR]  [ 0 ]  [ ⌫ ]          │
└────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Title | headline-lg `INSPECTOR ACCESS`; subtitle label `ENTER PIN` |
| PIN slots | Four boxes, 48 px, recessed surface, keyline border. Digits masked as `•` in telemetry-display. The active slot has a 2 px teal border |
| Key pad | 3×4 grid. Keys are 68 px high with an 8 px gap. Resting `#1E293B`, pressed `#334155`, JetBrains Mono 24 px |
| Bottom row | `CLR` clears all digits, `0`, `⌫` deletes one digit |
| Submit | Automatic on the 4th digit, after about 150 ms |
| Feedback | Haptic pulse per key where the device supports it (Android), plus a visible key illumination on every device |

**States**

| State | Behavior |
|---|---|
| Wrong PIN | Slots flash crimson outline, digits clear, message `INVALID PIN, 2 ATTEMPTS LEFT` in crimson |
| Locked | Amber-outlined dialog `PIN LOCKED` with a countdown `00:30` in telemetry-display. The keypad is disabled until it ends |
| Success | Slots flash emerald, then navigate to Page 4 |

### 6.4 Page 4: Results

**Goal:** the verdict is visible in under a second, with supporting evidence below.

**Mobile stack (top to bottom)**

```
┌────────────────────────────────┐
│ INSP: R. SHARMA  ● DEMO  00:52 │ Command deck
├────────────────────────────────┤
│▓▓ ⚠ ILLEGAL                  ▓▓│ Banner (crimson)
│▓▓ OPIOID-RELATED PATTERN     ▓▓│
│▓▓ 60–78% CONF                ▓▓│
├────────────────────────────────┤
│ ┌────────────────────────────┐ │
│ │ CAPTURED IMAGE             │ │
│ │ [ photo ]                  │ │
│ │ #A1042 · 14:33:41          │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ CONFIDENCE RANGE           │ │
│ │ 60–78% CONF                │ │
│ │ ░░░░░▓▓▓▓▓▓▓▓▓░░░░░░  ¦70  │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ GAS RESPONSE (SIMULATED)   │ │
│ │ MQ-135  ▓▓▓▓▓░░░░░  0.42   │ │
│ │ MQ-3    ▓▓░░░░░░░░  0.18   │ │
│ │ MQ-138  ▓▓▓▓░░░░░░  0.35   │ │
│ │ VOC     ▓▓▓▓▓░░░░░  0.51   │ │
│ │ TEMP 27.4 C   HUM 48 %     │ │
│ └────────────────────────────┘ │
│ Demo mode: simulated results,  │
│ not forensic.                  │
├────────────────────────────────┤
│ [ LOCK NOW ]   [  NEW TEST  ]  │
└────────────────────────────────┘
```

**Command deck**
- Left: `INSP: <NAME>` in label-md, always visible (inspector name pinned at the top per the PRD).
- Right: amber **DEMO** chip and an auto-lock countdown (`00:52`) in JetBrains Mono. When under 10 seconds, the countdown turns amber and pulses.

**Verdict banner (edge to edge, 0 px radius, fixed below the deck)**

| Variant | Background | Content |
|---|---|---|
| **Illegal** | `--crimson`, pulsating beacon dot (1 s cycle) | Line 1: `ILLEGAL` with a warning icon. Line 2: substance in headline-lg uppercase. Line 3: `60–78% CONF` in label-lg |
| **Legal** | `--emerald-deep`, 1 px `--emerald` keyline | Line 1: `LEGAL` with a check icon. Line 2: substance, for example `PARACETAMOL`. Line 3: `65–80% CONF` |
| **No target** (optional scenario) | `--emerald-deep` | `NO TARGET PATTERN` |

The Legal banner always names the substance, so an emerald banner is never mistaken for "nothing found". Banner text is white and set large and bold (see accessibility notes).

**Pods**

| Pod | Contents |
|---|---|
| Captured image | Photo (4 px radius, keyline), overlay with test ID and timestamp in label-sm |
| Substance | Micro-label `PREDICTED SUBSTANCE`, name in headline-md, category in body-md `--text-2`, caption `PREDICTED FROM CAPTURED GAS PATTERN` |
| Confidence range | Micro-label `CONFIDENCE RANGE`, `65–80% CONF` in telemetry-display. Below it a range bar: a 0–100 track with a filled segment from min to max, **amber up to 70%, emerald above 70%**, and a tick at 70 |
| Gas response | Micro-label `GAS RESPONSE (SIMULATED)`, four channel bars with numeric values in mono, then temperature and humidity |

**Tablet layout (768–1024 px):** the banner spans the full width. Below it, two columns: left holds the captured image and gas response; right holds the substance and confidence pods.

**Action Shelf**

| Button | Style | Behavior |
|---|---|---|
| `NEW TEST` | Primary teal, 56 px | Opens an amber-outlined confirm dialog: `CLEAR RESULT AND START NEW TEST?` with `CANCEL` (secondary) and `CLEAR` (primary). On confirm, return to Page 1 |
| `LOCK NOW` | Secondary outlined | Immediately hides results and returns to Page 3 |

**Auto-lock:** after 60 s with no interaction, the screen locks and returns to the PIN screen. Any touch resets the timer.

## 7. Component summary

| Component | Rule |
|---|---|
| Primary button | Min 56 px high, teal fill, obsidian text, Space Grotesk 700. Glow on press |
| Secondary button | 1.5 px `#475569` outline on `#1E293B`, cold-white text |
| Pod | `--bg-pod`, 1 px `--keyline`, 4 px radius, micro-label above value |
| Banner | Edge to edge, 0 px radius, fixed under the command deck |
| Dialog | `--bg-overlay` solid backing, 2 px amber (caution) or crimson (fail) outline, no transparency |
| Input well | `--bg-recessed`, keyline border, 2 px teal border on focus |
| Chip | 4 px radius, label-sm uppercase. DEMO chip is amber outline with amber text |

## 8. Motion and feedback

- Motion is short and functional: 100–150 ms press feedback, about 400 ms page transitions (a plain slide or cut).
- The pulsating beacon on the Illegal banner is the only looping animation.
- Respect `prefers-reduced-motion`: replace the pulse with a static bright beacon.
- Haptics: use `navigator.vibrate` where supported. Never rely on it as the only feedback.

## 9. Accessibility and field legibility

- **Never color alone.** Verdicts always carry a text label (`ILLEGAL` / `LEGAL`) and an icon.
- **Contrast.** White on crimson `#EF4444` is about 3.8:1, which is acceptable only for large bold text. Keep body copy off crimson and use crimson only for the banner title, confidence line and fail states.
- **Targets.** All touch targets are at least 48×48 px; primary actions and keys are 56–68 px.
- **Glare and sun.** Dark backgrounds with near-white text. Avoid mid-grey text below 13 px. `--text-off` is for inactive items only.
- **Focus.** Visible 2 px teal focus ring for keyboard and switch access.
- **Screen readers.** Verdict banner is an `aria-live="polite"` region so the result is announced once on unlock.

## 10. Microcopy

| Screen | Text |
|---|---|
| Page 1 title | `CONFIRM SAMPLE INPUT` |
| Page 1 button | `CONFIRM: INPUT TAKEN` → `SESSION STARTED` |
| Page 2 hint | `ALIGN SUBJECT WITHIN FRAME` |
| Page 2 buttons | `CAPTURE`, `FLIP`, `RETAKE`, `USE PHOTO` |
| Page 3 title | `INSPECTOR ACCESS` / `ENTER PIN` |
| Page 3 errors | `INVALID PIN, 2 ATTEMPTS LEFT` / `PIN LOCKED` |
| Page 4 labels | `PREDICTED SUBSTANCE`, `CONFIDENCE RANGE`, `GAS RESPONSE (SIMULATED)`, `PREDICTED FROM CAPTURED GAS PATTERN` |
| Page 4 disclaimer | `Demo mode: simulated results, not forensic.` |
| Page 4 buttons | `NEW TEST`, `LOCK NOW` |

## 11. Implementation notes for handoff

- Define all tokens above as CSS variables on `:root`; do not hardcode hex values in components.
- Load Space Grotesk, Inter and JetBrains Mono from Google Fonts with system fallbacks (`ui-monospace`, `system-ui`), and use tabular numerals for all telemetry.
- Build Page 1 as its own HTML file or route with its own stylesheet, so no shared component can leak into it.
- Verdict styling is driven by the scenario's `legality` field; the confidence range comes from `confidence_min` / `confidence_max`. The UI has no scenario-specific code.
- Test on a real phone in bright light, with a gloved finger if possible, before the demo.

## 12. Open questions

1. **Which palette is correct?** The frontmatter tokens and the prose palette in DESIGN.md differ. This brief assumes the prose palette.
2. **Photo subject.** Person or sample? It changes the camera hint text (`ALIGN SUBJECT` vs `ALIGN SAMPLE`) and the default camera (front vs rear).
3. **Inspector name format.** Full name, rank or badge ID? It affects the command-deck width on 360 px screens.
4. **Legal banner tone.** Should legal substances use the emerald "clearance" style as proposed, or a neutral style to keep emerald exclusively for "nothing found"?
5. **Auto-lock duration.** 60 s is assumed; confirm for the demo setting.
