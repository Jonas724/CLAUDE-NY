# Studio Director — driftsystem

Detta är driftsinfrastrukturen för den autonoma YouTube-produktionsmotorn.
Systemet producerar **inget** förrän Sektion 1 (nisch & positionering) är ifylld
och godkänd av människan. Se `00-niche-positioning.md`.

## Var vi är just nu

**STATUS: BLOCKERAD VID SEKTION 1.**
Nisch, målgrupp, format, kanallöfte, referenskanaler och kadens är odefinierade.
Enligt Grundregel 6 sätts nischen av människan och ändras aldrig utan explicit order.
Enligt stopp-regeln levererar motorn hellre ingenting än undermåligt material.
Denna scaffolding är därför förberedelsen — inte produktionen.

## Mappstruktur

```
studio/
├── README.md                  (denna fil)
├── 00-niche-positioning.md    Sektion 1 — MÅSTE fyllas i innan produktion
├── pipeline.md                Buffert- och kadensspårning (Sektion 8)
├── templates/
│   ├── production-log.md       Per-video logg (Sektion 7 + 12)
│   ├── quality-gates.md        Sektion 9 — grindchecklista
│   └── video-report.md         Sektion 12 — rapportformat
└── production-logs/           En kopia av production-log.md per video
```

## Arbetsflöde per video (när nischen är låst)

1. Kopiera `templates/production-log.md` → `production-logs/video-NNN.md`.
2. Idégenerering + validering (Sektion 2) → logga poäng och förkastade idéer.
3. Titel + thumbnail FÖRE manus (Sektion 3).
4. Manus → röst → bild → metadata (Sektion 4–7).
5. Kör HELA grindlistan (`quality-gates.md`). Alla JA → publicera. Annat → iterera (max 3).
6. Fyll i `video-report.md` och uppdatera `pipeline.md`.
7. 48 h + 7 dagar: hämta mätvärden (Sektion 10), logga, mata in i nästa video.

## Beslut som krävs av människan innan start

- Nisch (permanent) — se `00-niche-positioning.md`
- Marknad + språk
- Format (longform / Shorts / båda)
- Kadens (videor per vecka)
- Godkännande att köra vidIQ-anrop (research) och genererings-MCP (Higgsfield/Magnific/Canva)
- Bekräftad YouTube-kanalkoppling (för publicering + Analytics-loopen)
