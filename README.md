# ComuNick

Alternative Communication for Non-Verbal Autistic Children

**ComuNick** is a high-tech alternative communication web application (PWA), free, accessible, and customizable. It transforms any device with a browser — Android phone, tablet, Chromebook, computer — into a pictogram-based communication board with speech synthesis.

The name comes from **Comu**nication + **Nick** (my son's nickname, who inspired the project).

**Live at: [https://comunick.linkzy.dev](https://comunick.linkzy.dev)**

---

## Target Audience

- Non-verbal or minimally verbal autistic children and adults
- Speech therapists who need customized boards for each patient
- Parents and caregivers looking for a free alternative to paid solutions (e.g., TD Snap, Proloquo2Go, Cboard Premium)

## Main Features

- **Fully customizable pictogram grid** (rows × columns defined by the therapist)
- **Two TTS engines:** native browser TTS (default, works offline) or Narrator TTS API (higher quality, requires internet + API key)
- **Admin mode** for professionals to set up the board (accessible via 3-finger 5-second long press)
- **Multi-language** (pt-BR, en, es) — switch anytime, voice updates automatically
- **100% offline** — after loading pictograms, works without internet (PWA + IndexedDB)
- **ARASAAC integration** — free, standardized pictograms from the largest AAC symbol library
- **Audio caching** — generated speech from Narrator TTS is cached in IndexedDB for repeat playback
- **No costs, no subscription, no app stores**
- **PWA installable** — add to home screen, hides system nav bar in fullscreen mode

## Technologies

| Layer                | Technology                          |
|----------------------|-------------------------------------|
| Interface            | React 18 + Vite                     |
| PWA                  | vite-plugin-pwa                     |
| Persistence          | IndexedDB (idb)                     |
| Internationalization | i18next                             |
| Voice (native)       | Web Speech API                      |
| Voice (premium)      | Narrator TTS API (proxy via nginx)  |
| Pictograms           | ARASAAC API                         |
| Deployment           | Docker + GitHub Actions (GHCR)      |
| Icons                | sharp-generated custom icon         |

## Architecture

```
Client (PWA) ──► /api/tts/synthesize ──► nginx proxy ──► Narrator TTS API
                     (no API key)         (adds X-API-Key)
```

The API key is set as an environment variable at container runtime — never in client-side JavaScript or Docker image layers.

## Attribution

- **Pictograms:** ARASAAC (https://arasaac.org) — CC BY-NC-SA 4.0
- **TTS:** Web Speech API (native) and Narrator TTS API

## License

**CC BY-NC-SA 4.0** — Non-commercial use, attribution, share-alike.

Pictograms via [ARASAAC](https://arasaac.org) — CC BY-NC-SA license.

---

## For Developers

Detailed technical documentation for AI agents and contributors is in `/docs/`. Start with `/docs/CONTEXT.md`.
