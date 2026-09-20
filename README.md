# NarcoSense: Field Operator Web App (Demo Build)

> **Tactical Instrumentalism · Rapid Field Narcotics Screening**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 1. Overview

**NarcoSense** is a tactical-grade, operator-facing web application engineered for field officers, border patrol agents, and forensic inspection teams. It guides an inspector through a strict, zero-leak screening workflow:

1. **Step 1: Confirm Sample Input** (Isolated standalone screen; purges chamber and initiates test session).
2. **Step 2: Optical Capture & Review** (Camera framing viewport with 1280px JPEG capture, retake capability, and device file fallback).
3. **Step 3: Inspector PIN Unlock** (Completely neutral screen; 3×4 numeric keypad with a 3-attempt limit and 30-second security lockdown).
4. **Step 4: Evidence Telemetry Dashboard** (Decisive edge-to-edge Legal/Illegal verdict banner, captured photo watermark, confidence range meter, 4-channel gas sensor array, and 60-second inactivity auto-lock).

---

## 2. Design System: "Tactical Instrumentalism"

Designed specifically for glove-friendly field operation and high sunlight legibility:
- **3-Zone Layout:** 48px fixed Command Deck (top), Telemetry Canvas (center), 80px fixed Action Shelf (bottom).
- **Dark Carbon Palette:** Recessed base `#020617`, Deck surface `#0F172A`, Instrument Pods `#1E293B`, Keylines `#334155`.
- **Status Signals:** Nominal Emerald (`#10B981` / `#064E3B`), Threat Crimson (`#EF4444`), Alert Amber (`#F59E0B`), Tactical Teal (`#0D9488`).
- **Typography:** Space Grotesk (Headlines & Verdicts), Inter (Body & Instructions), JetBrains Mono (Tabular telemetry, readouts, and PIN matrix).

---

## 3. Demo PIN Scenarios

Configured in `src/config/scenarios.json` and abstracted via the swappable `getResult(sessionId, pin)` service interface:

| PIN | Inspector | Displayed Substance | Legality | Confidence Range | Simulated Gas Pattern |
|:---:|:---|:---|:---:|:---:|:---|
| **`1234`** | Inspector A | Paracetamol (OTC) | **LEGAL** | 65–80% | MQ-135: 0.42, MQ-3: 0.18, VOC: 0.51 |
| **`2345`** | Inspector B | Ibuprofen (OTC) | **LEGAL** | 60–75% | MQ-135: 0.38, MQ-3: 0.22, VOC: 0.44 |
| **`4567`** | Inspector C | Cannabinoid-related pattern | **ILLEGAL** | 55–70% | MQ-135: 0.74, MQ-3: 0.65, VOC: 0.82 |
| **`5678`** | Inspector R. Sharma | Opioid-related pattern | **ILLEGAL** | 60–78% | MQ-135: 0.88, MQ-3: 0.79, VOC: 0.91 |
| **`6789`** | Inspector D | Stimulant-related pattern | **ILLEGAL** | 58–72% | MQ-135: 0.69, MQ-3: 0.71, VOC: 0.86 |

---

## 4. Hardware & Architecture Extensibility

The web app is structured so that the mock `getResult()` function can be cleanly swapped for real ESP32 microcontroller telemetry and machine learning classifier output via WebSocket or HTTP REST without altering UI components.

Captured photos are safely persisted in the browser via **IndexedDB** keyed by `sessionId`, ensuring client-side data isolation until forensic sync is enabled.

---

## 5. Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/harshitmathur456/NacroSense.git
cd NacroSense

# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```
