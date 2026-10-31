# Generative Immersion

Website of the Generative Immersion initiative: AI-generated immersive situations as research instruments for the behavioral sciences.
Live at **https://generative-immersion.com** (GitHub Pages, custom domain in `CNAME`; www redirects to it).

Promoters: Ranran Li (Max Planck Institute for the Study of Crime, Security and Law) and Botao Amber Hu (University of Oxford).

## Pages

| Address | File | What it is |
|---|---|---|
| `/` | `index.html` | Main page: 01 About, 02 Technology (three strands side by side: Video models, Real-time world models, 3D worlds & objects, and a Follow AI advances button), 03 Ongoing research (perspective paper, two studies, journal outlets link), 04 Promise, 05 People & connect |
| `/AI-advances/` | `AI-advances/index.html` + `items.json` | AI advances in five horizontal strands (like the Exhibition page on ranranli.net, turned on its side), under the night sky |
| `/journals/` | `journals/index.html` | Forwards to the Generative Immersion Journal Atlas on ranranli.net |
| any missing page | `404.html` | Glass "not found" page |

Addresses are case-sensitive: `/AI-advances/` works, `/ai-advances/` does not.

## Look

Liquid glass in the style of the launch pad on ranranli.net: blue-tinted glass (`--glass`, `backdrop-filter: blur(22px) saturate(165%)`) over the launch pad's pastel peaks (`assets/peaks.svg`).
As the page scrolls to People, the sky turns to the ranranli.net night (`assets/peaks-night.svg`, stars drawn on a canvas in `assets/site.js`), and the contact cards use the homepage's clearer glass (`.glass-clear`).
Fonts: Inter (Google Fonts), DM Mono for labels, Georgia italic for accents. Strand colours come from the ranranli.net research strands.

## Adding an AI advance

The page has five strands, each a row of cards that scrolls sideways, newest first:

| `kind` | Strand |
|---|---|
| `video` | 01 Video models |
| `world` | 02 Real-time world models |
| `3d` | 03 3D worlds & objects |
| `people` | 04 Virtual people (empty for now; shows "Coming soon") |
| `device` | 05 Equipment: Headsets & glasses |

The strand names, colours and one-line descriptions sit at the top of `assets/advances.js` (`STRANDS`).
Add an object to `items` in `AI-advances/items.json`:

```json
{
  "id": "short-id",
  "name": "Model name",
  "org": "Who made it",
  "kind": "video | world | 3d | people | device",
  "status": "optional label, e.g. Preview, Early access, Announced (leave out once it is released)",
  "date": "YYYY-MM-DD (release; the card shows the maker and month, e.g. \"Google DeepMind, released Oct 2026\")",
  "dateNote": "optional, replaces the word released, e.g. announced, on sale since, in Germany since",
  "added": "YYYY-MM-DD (shows a New tag for 14 days)",
  "summary": "Two or three lines on what it does.",
  "why": "One line on why it matters for research.",
  "link": "https://official announcement",
  "linkLabel": "Announcement",
  "links": [{ "label": "Model page", "url": "https://…", "icon": "page | code | play | paper | github | form | world" }],
  "img": "img/short-id.webp (16:9, about 800×450), or an official https picture such as a frame of the official YouTube video (https://i.ytimg.com/vi/<video id>/maxres1.jpg); leave out for a colour tile with the name",
  "imgAlt": "What the picture shows",
  "credit": "Where the picture comes from"
}
```

Update `"updated"` at the top of the file. Pictures from other sites are linked, not copied; a heavy one (over about 500 KB) is better saved here as `img/short-id.webp` at 800×450.

## Ongoing research cards

The section opens with the perspective paper (`article.paper`, a TBC stamp until the preprint is out) and closes with the link to the journal outlets (`a.outlets`).
Each project in between is an `article.project`: the figure on the left (`figure.project-fig`, `--fig` sets the colour around it), then label, title, subtitle, description and a `Related publications` list. Scalable Immersion uses `assets/figures/scalable-immersion.webp`; the Generative Enactments diagram is an inline SVG. On phones the figure moves above the text.

## Videos on the main page

- Seedance 2.5 clips play straight from ByteDance Seed's official announcement (their CDN, `preload="none"` until the strand is near). If a clip ever stops loading, a link to the announcement replaces it.
- Genie 4 (Google DeepMind, `sFfPkUJd_Jk`) and Marble (World Labs, `UslQB4LUueI`) are YouTube videos from the official channels. The page shows a still and loads the player (youtube-nocookie.com) only when clicked. To swap one, change `href`, `data-yt` and the `img` in `index.html`.
- ByteDance's world model has been shown on stage but not released, so it sits in a dashed "not released yet" box (`.pending`) in the World generation strand, with links to the reports. Swap in a video once ByteDance publishes one.

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
