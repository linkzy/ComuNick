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
- **Native browser Text-to-Speech (TTS)** when tapping each cell, voice auto-selects by language
- **Admin mode** for professionals to set up the board (accessible via 3-finger 5-second long press)
- **Multi-language** (pt-BR, en, es) — switch anytime, voice updates automatically
- **100% offline** — after loading pictograms, works without internet (PWA + IndexedDB)
- **ARASAAC integration** — free, standardized pictograms from the largest AAC symbol library
- **No costs, no subscription, no app stores**

## Technologies

| Layer          | Technology        |
|---------------|-------------------|
| Interface     | React 18 + Vite   |
| PWA           | vite-plugin-pwa    |
| Persistence   | IndexedDB (idb)   |
| Internationalization | i18next    |
| Voice         | Web Speech API    |
| Pictograms    | ARASAAC API       |
| Deployment    | Docker + GitHub Actions |

## License

**CC BY-NC-SA 4.0** — Non-commercial use, attribution, share-alike.

Pictograms via [ARASAAC](https://arasaac.org) — CC BY-NC-SA license.

---

## For Developers

Detailed technical documentation for AI agents and contributors is in `/docs/`. Start with `/docs/CONTEXT.md`.
