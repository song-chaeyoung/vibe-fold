# Vibe Fold

Interactive visual stories for [Vibe Coding Club](https://vibecodingclub.kr/).  
Site shell is Astro; each chapter is an independent interactive artwork loaded in a sandboxed iframe.

**Production host:** `https://fold.vibecodingclub.kr`

## Stack

- Astro (static)
- Content as folders + YAML under `content/`
- Chapters: finished `index.html` + local assets → iframe (`sandbox="allow-scripts"`)

## Routes

| Path | Page |
|------|------|
| `/` | Home (featured volume + archive grid) |
| `/vol/{number}-{slug}` | Volume |
| `/vol/{number}-{slug}/ch/{order}-{slug}` | Chapter (chrome + iframe) |

## Develop

Requires Node.js `>=22.12`.

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Content layout

```
content/
  _templates/                  # same shape as a volume; copy a chapter or the whole folder
    volume.yaml
    ch-00-untitled/
  vol-01-seolhwa/              # Vol.1 설화 — open call, coming soon
    volume.yaml
  vol-00-sokdam/               # Vol.0 속담 — example volume
    volume.yaml
    ch-01-gorae-ssaume-saeu/
```

Chapter order is the `chapters:` list in each `volume.yaml` (folder names, top to bottom). `volume.yaml` / chapter `meta.yaml` schemas and contribution rules: see [CONTRIBUTING.md](./CONTRIBUTING.md).

Home / archive covers use the first chapter thumbnail. On `astro dev` / `astro build`, chapter folders are synced to:

- `public/chapters/{volId}/{chId}/`

Those generated paths are gitignored.

## Deploy (Vercel)

1. Import this repo in Vercel (Astro preset / `npm run build`, output `dist`).
2. Attach custom domain `fold.vibecodingclub.kr`.
3. DNS: CNAME `fold` → Vercel target (or A/ALIAS per Vercel docs).
4. If migrating from `magazine.vibecodingclub.kr`, remove that domain and its DNS record after `fold` is live.

Editors create volumes; contributors open PRs that add a single chapter folder.
