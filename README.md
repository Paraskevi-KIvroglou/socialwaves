# 🌊 SurfSignal

**Forecasts predict. Surfers verify.**

SurfSignal is a hackathon MVP that combines marine weather forecasts (Open-Meteo) with real surfer reports to answer:

- Which beach is best today
- Whether the forecast was actually correct
- Personalized surf insights per user

## Core idea

Most surf apps stop at prediction. SurfSignal goes further:

- Compares forecast vs real surfer reports
- Learns which beaches are reliable
- Adapts to each surfer’s preferences

## Agent system

- **Forecast Agent** — reads weather data
- **Beach Scout Agent** — finds best spots
- **Reality Check Agent** — compares real reports
- **Trust Score Agent** — scores accuracy
- **Personal Coach Agent** — learns user preferences

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- Open-Meteo API
- Local mock data (MVP)

## MVP features

- Surfer profile
- Beach forecast
- Surf score
- Condition reporting
- Forecast accuracy
- Personal analytics

## Demo flow

1. View forecast
2. Check surf score
3. Submit a real-world report
4. See forecast vs reality
5. Get personal insights

## Setup

```bash
npm install
npm run dev
```

## Vision

*“The Waze of surfing — powered by real surfers.”*

## Quick structure

```text
surf-signal/
├── README.md
└── .cursor/
    └── rules/
        ├── product.mdc
        ├── tech-stack.mdc
        ├── openmeteo.mdc
        ├── agents.mdc
        └── ui.mdc
```
