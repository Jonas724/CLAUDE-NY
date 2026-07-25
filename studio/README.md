# Studio Director

Produktionssystem för en faceless YouTube-automationskanal. Systemet finns till
för att eliminera de fem vanligaste dödsorsakerna för automationskanaler:
återanvänt innehåll (demonetisering), svag paketering (ingen ser videon), svag
hook (ingen stannar), inkonsekvent kadens (algoritmen glömmer dig) och avsaknad
av feedback-loop (samma misstag repeteras).

## Filer

| Fil | Roll |
|---|---|
| `00-DRIFTSPEC.md` | Grundregler, pipeline, produktionsstandarder. Ändras bara på explicit order. |
| `01-kanalprofil.md` | Nisch, målgrupp, format, kanallöfte, kadens, referenskanaler, nischtest. |
| `02-idebank.md` | 20 kandidater per omgång, poängsatta. Endast ≥24/30 går vidare. |
| `04-kvalitetsgrindar.md` | 15 kontrollpunkter. Alla JA innan publicering. |
| `05-analys.md` | Mätlogg 48 h och 7 d, rullande snitt, obduktioner, förbjudna mönster. |
| `mallar/paketering.md` | Titel- och thumbnailbrief. Fylls i FÖRE manus. |
| `mallar/manus.md` | Manusmall med loop-register och källtabell. |
| `mallar/produktionslogg.md` | Beslutslogg per video: val, förkastade alternativ, licenser. |
| `videor/` | En mapp per video: `videor/001-kort-slug/` med kopior av mallarna ifyllda. |
| `loggar/` | Grindkörningar och eskaleringar. |

## Arbetsordning per video

```
kopiera mallar/ → videor/00n-slug/
  paketering.md   ← fylls i först
  manus.md        ← först när titeln är vald
  produktionslogg.md ← fylls i löpande, inte i efterhand
  kvalitetsgrindar.md ← körs i sin helhet, om och om, max 3 varv
```

## Rapportformat

Efter varje slutförd video:

```
VIDEO #[n] — [titel]
Status: PUBLICERAD / STOPPAD VID GRIND [x]
Idépoäng: xx/30 | Grindar: 15/15 godkända
Nyckelbeslut: [3 punkter]
Risker/avvikelser: [eller "inga"]
Nästa video i pipeline: [titel] — ETA [datum]
Buffertstatus: [n] videor i kö
```

## Status

**Produktionen är blockerad.** `01-kanalprofil.md` är inte ifylld. Nisch, målgrupp,
format och kadens måste fastställas av människan innan idégenerering får påbörjas
(grundregel 6: nisch byts aldrig utan explicit instruktion — därför får den inte
heller väljas av systemet självt).
