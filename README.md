# Generative Immersion

Website of the Generative Immersion initiative: AI-generated immersive situations as research instruments for the behavioral sciences.
Live at **https://generative-immersion.com** (GitHub Pages, custom domain in `CNAME`; www redirects to it).

Promoters: Ranran Li (Max Planck Institute for the Study of Crime, Security and Law) and Botao Amber Hu (University of Oxford).

## Pages

| Address | File | What it is |
|---|---|---|
| `/` | `index.html` | Main page: 01 About, 02 Technology, 03 Ongoing research, 04 Promise, 05 People & contact, 06 Paper (with the journal outlets link beneath it) |
| `/AI-advances/` | `AI-advances/index.html` + `items.json` | Picture-first cards tracing AI advances |
| `/journals/` | `journals/index.html` | Forwards to the Generative Immersion Journal Atlas on ranranli.net |
| any missing page | `404.html` | Glass "not found" page |

Addresses are case-sensitive: `/AI-advances/` works, `/ai-advances/` does not.

## Look

Liquid glass in the style of the launch pad on ranranli.net: blue-tinted glass (`--glass`, `backdrop-filter: blur(22px) saturate(165%)`) over the launch pad's pastel peaks (`assets/peaks.svg`).
As the page scrolls to People, the sky turns to the ranranli.net night (`assets/peaks-night.svg`, stars drawn on a canvas in `assets/site.js`), and the contact cards use the homepage's clearer glass (`.glass-clear`).
Fonts: Inter (Google Fonts), DM Mono for labels, Georgia italic for accents. Strand colours come from the ranranli.net research strands.

## Adding an AI advance

Add an object to `items` in `AI-advances/items.json` (newest dates show first):

```json
{
  "id": "short-id",
  "name": "Model name",
  "org": "Who made it",
  "kind": "video | world | 3d | avatar | tool | paper",
  "date": "YYYY-MM-DD (release)",
  "added": "YYYY-MM-DD (shows a New tag for 14 days)",
  "summary": "Two or three lines on what it does.",
  "why": "One line on why it matters for research.",
  "link": "https://official announcement",
  "linkLabel": "Announcement",
  "links": [{ "label": "Model page", "url": "https://…", "icon": "page | code | play | paper | github" }],
  "img": "img/short-id.webp (16:9, about 800×450; leave out for a colour tile with the name)",
  "imgAlt": "What the picture shows",
  "credit": "Where the picture comes from"
}
```

Update `"updated"` at the top of the file. Filter chips appear once there are two or more kinds.

## Ongoing research cards

Each project in `index.html` is an `article.project`: the figure on the left (`figure.project-fig`, `--fig` sets the colour around it), then label, title, subtitle, description and a `Related publications` list. Scalable Immersion uses `assets/figures/scalable-immersion.webp`; the Generative Enactments diagram is an inline SVG. On phones the figure moves above the text.

## Videos on the main page

- Seedance 2.5 clips play straight from ByteDance Seed's official announcement (their CDN, `preload="none"` until the strand is near). If a clip ever stops loading, a link to the announcement replaces it.
- Genie 3 (Google DeepMind) and Marble (World Labs) are YouTube videos from the official channels. The page shows a still and loads the player (youtube-nocookie.com) only when clicked. To swap one, change `href`, `data-yt` and the `img` in `index.html`.

## Domain

DNS at Namecheap (Advanced DNS):

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | catherineranran.github.io. |

GitHub Pages serves from `main`, root folder, with the custom domain `generative-immersion.com` (the `CNAME` file); www redirects to it. Change the domain by editing `CNAME`, not by re-saving the field in Settings → Pages. Pages can take up to 10 minutes to show a change.
