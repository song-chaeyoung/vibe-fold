# Contributing a chapter

Vibe Fold chapters are **self-contained interactive artworks**. Contributors add a folder via GitHub pull request. The site shell (home, volume pages, prev/next chrome) is maintained by editors — you only touch your chapter directory.

## Quick start

1. Copy the template:

```bash
cp -R content/_templates/ch-00-untitled \
  content/vol-01-seolhwa/ch-01-my-piece
```

2. Edit `meta.yaml`:
   - `slug` — URL-safe kebab-case
   - `title`, `author`, `summary`, `thumb`
   - Folder name should match `ch-{suggested-number}-{slug}`
   - Chapter order is **not** set here. An editor adds your folder name to that volume's `volume.yaml` `chapters:` list.

3. Replace `index.html` (and assets) with your artwork.
4. Replace `thumb.svg` / `thumb.jpg` (portrait ~3:4 works best).
5. Open a PR that only includes your chapter folder (unless an editor asked you to change volume metadata).

## Chapter contract

Required files inside `content/<volume>/<chapter>/`:

| File | Purpose |
|------|---------|
| `meta.yaml` | Listing + chrome metadata |
| `index.html` | Entrypoint loaded in an iframe |
| thumb file referenced by `meta.yaml` | Volume grid thumbnail |

`meta.yaml` fields:

```yaml
id: ch-04-my-piece
slug: my-piece
title: My Piece
author: your-handle   # @ is optional; UI adds it
summary: |
  Short description for the volume page and prev/next labels.
thumb: thumb.svg
```

Editors own chapter order in `volume.yaml`. The list is 1-based (`Ch.1`, `Ch.2`, …) and is the only source of truth:

```yaml
chapters:
  - ch-01-first-piece
  - ch-04-my-piece
  - ch-02-another-piece
```

Folders listed here must exist. Folders that are not listed are ignored (useful for drafts). Reorder by moving lines.

URL shape (generated automatically):

`/vol/{volumeNumber}-{volumeSlug}/ch/{order}-{slug}`

## Hard rules

1. **Local assets only** — images, fonts, scripts, and data must live in your chapter folder. No CDN, no remote fonts, no `fetch` to the internet.
2. **Ship built output** — PR the finished `index.html` + assets. CI does not build chapter toolchains for you.
3. **Sandbox** — chapters run in `<iframe sandbox="allow-scripts">` (no `allow-same-origin`). That means:
   - `localStorage` / cookies are unavailable
   - you cannot access the parent page
   - keep state in memory
4. **Do not edit the shell header** — prev / logo / next is owned by the site. Your page should assume a small top overlay.
5. **Volumes are editor-owned** — do not add `volume.yaml`, change the `chapters:` list, or create new volumes unless you are coordinating with an editor. Editors start a volume with `cp -R content/_templates content/vol-02-my-volume`.

## Local preview

```bash
npm install
npm run dev
```

- Example volume: `/vol/0-sokdam`
- Volume page: `/vol/1-seolhwa` (published volumes only)
- Your chapter: `/vol/1-seolhwa/ch/{order}-{slug}`
- Raw iframe document: `/chapters/1-seolhwa/{order}-{slug}/index.html`

Chapter files under `content/` are synced into `public/chapters` when Astro starts or builds.

## Review checklist

- [ ] `meta.yaml` + `index.html` + thumb present
- [ ] Relative asset paths only
- [ ] Works with keyboard / pointer where interaction matters
- [ ] No reliance on `localStorage`
- [ ] PR scope limited to your chapter folder
