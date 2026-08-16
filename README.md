# Vibe Fold

Interactive visual stories for [Vibe Coding Club](https://vibecodingclub.kr/).  
Site shell is Astro; each chapter is an independent interactive artwork loaded in a sandboxed iframe.

**Production host:** `https://fold.vibecodingclub.kr`

## Stack

- Astro (static)
- Content as folders + YAML under `content/volumes`
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
  _templates/chapter/          # copy this to start a chapter
  volumes/
    vol-05-nike/
      volume.yaml
      cover.svg
      chapters/
        ch-01-just-do-it/
          meta.yaml
          thumb.svg
          index.html
```

`volume.yaml` / chapter `meta.yaml` schemas and contribution rules: see [CONTRIBUTING.md](./CONTRIBUTING.md).

On `astro dev` / `astro build`, chapter folders and volume covers are synced to:

- `public/chapters/{volId}/{chId}/`
- `public/volumes/{volId}/`

Those generated paths are gitignored.

## Deploy (Vercel)

1. Import this repo in Vercel (Astro preset / `npm run build`, output `dist`).
2. Attach custom domain `fold.vibecodingclub.kr`.
3. DNS: CNAME `fold` → Vercel target (or A/ALIAS per Vercel docs).
4. If migrating from `magazine.vibecodingclub.kr`, remove that domain and its DNS record after `fold` is live.

Editors create volumes; contributors open PRs that add a single chapter folder.
