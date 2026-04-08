# CLAUDE.md

This file provides guidance for AI assistants (Claude Code and similar tools) working with this repository.

## Project Overview

This is the personal blog of **M. Serdar Karaman**, hosted at <https://karaman.dev>. It is a static site built with **Jekyll 4.2** using the **Start Bootstrap Clean Blog** theme. The blog covers software engineering, programming (C, C++, Qt, Python), Linux, avionics, and related topics. Most posts are written in Turkish (`lang: tr`).

- **Live site:** <https://karaman.dev>
- **Source branch:** `master` (GitHub Actions deploys to `gh-pages`)
- **Custom domain:** `karaman.dev` (see `CNAME`)

## Repository Structure

```
.
├── _config.yml              # Jekyll site configuration
├── Gemfile                  # Ruby gem dependencies
├── package.json             # Upstream theme metadata (informational only)
├── CNAME                    # Custom domain for GitHub Pages
├── ads.txt                  # Ad network authorization file
├── index.html               # Homepage (layout: home)
├── about.md                 # About page
├── contact.html             # Contact page
├── favicon.jpg              # Source favicon (processed by jekyll-favicon)
├── _layouts/                # Page layouts
│   ├── default.html         # Base layout (head/navbar/footer/scripts)
│   ├── home.html            # Homepage layout
│   ├── page.html            # Static page layout
│   └── post.html            # Blog post layout (includes Disqus)
├── _includes/               # Reusable partials
│   ├── head.html            # <head> with SEO, fonts, Mermaid.js
│   ├── navbar.html
│   ├── footer.html
│   ├── scripts.html
│   ├── google-analytics.html
│   └── read_time.html       # Reading-time estimator
├── _sass/
│   └── styles.scss          # Main Sass partial
├── _posts/                  # Blog posts (YYYY-MM-DD-slug.md)
├── assets/
│   ├── main.scss            # Sass entry point, compiled to main.css
│   ├── codehighlights.css
│   ├── scripts.js
│   └── vendor/              # Bootstrap, jQuery, Font Awesome, etc.
├── img/
│   ├── bg-*.jpg             # Page header backgrounds
│   ├── me-animated.gif
│   └── posts/               # Post hero images (1.jpg, 2.jpg, ...)
├── posts/
│   └── index.html           # Paginated post index (/posts/)
├── bin/
│   └── cibuild              # One-line build script: `bundle exec jekyll build`
├── sonar-project.properties # SonarCloud configuration
├── .github/workflows/       # CI/CD (see below)
└── .gitignore               # Ignores _site, .jekyll-cache, Gemfile.lock, node_modules
```

## Tech Stack

- **Static site generator:** Jekyll `~> 4.2.0`
- **Theme:** [Start Bootstrap Clean Blog Jekyll](https://startbootstrap.com/themes/clean-blog-jekyll/) (forked/vendored)
- **Markdown:** kramdown
- **Sass:** compressed output
- **Frontend:** Bootstrap 4.6, jQuery 3.6, Font Awesome 5.15, Google Fonts (Lora, Open Sans)
- **Diagrams:** Mermaid.js 9.1.3 (loaded via CDN in `_includes/head.html`)
- **Comments:** Disqus (shortname `karaman-dev`, embedded in `_layouts/post.html`)
- **Analytics:** Google Analytics (`G-YDEV31NZ5J`)

### Jekyll plugins (from `_config.yml` / `Gemfile`)

- `jekyll-feed` — RSS/Atom feed at `/feed.xml`
- `jekyll-paginate` — 5 posts per page, path `/posts/page:num/`
- `jekyll-sitemap`
- `jekyll-admin` — local-only admin UI
- `jekyll-seo-tag`
- `jekyll-email-protect`
- `jekyll-spaceship` — enhanced Markdown (Mermaid, math, etc.)
- `jekyll-favicon` — generates favicons from `favicon.jpg`
- `jekyll-coffeescript`

## Development Workflows

### Local development

```bash
bundle install
bundle exec jekyll serve
# http://localhost:4000
```

### Build only

```bash
bundle exec jekyll build
# or:
bin/cibuild
```

Output goes to `_site/` (gitignored).

### Deployment

Deployment is automated via GitHub Actions:

- `.github/workflows/build-jekyll.yml` — on push to `master`, uses `jeffreytse/jekyll-deploy-action@v0.6.0` to build and publish to the `gh-pages` branch. Ruby 3.2.0 and a compatible Bundler `~>2.5.0` are used. ImageMagick is installed as a pre-build dependency.

Other workflows:

- `calibreapp-image-actions.yml` — compresses images in PRs
- `codacy.yml` — Codacy code quality analysis
- `codeql-analysis.yml` — GitHub CodeQL security scan
- `dependency-review.yml` — dependency review on PRs

SonarCloud configuration is in `sonar-project.properties` (`sonar.projectKey=Mavrikant_mavrikant.github.io`, org `mavrikant`).

## Authoring Blog Posts

### File naming

Posts live in `_posts/` and follow Jekyll's required naming convention:

```
_posts/YYYY-MM-DD-slug-in-kebab-case.md
```

### Front matter template

Use this structure (see existing posts like `_posts/2026-04-05-misra-c-2025-ile-neler-degisti.md` for a full example):

```yaml
---
title: "Post Title"
subtitle: "Optional English or secondary subtitle"
background: "/img/posts/7.jpg"
date: '2026-04-05 09:00:00'
layout: post
lang: tr
---
```

Notes:

- `layout: post` is required.
- `background` should reference an image under `/img/posts/` (these are the hero header images).
- `lang: tr` is used for Turkish posts and is passed through to the `<div class="container" lang="tr">` in `_layouts/post.html`. Use `lang: en` for English posts.
- `date` is used for ordering, reading-time display, and pagination.
- The post content body is plain Markdown (kramdown). Mermaid diagrams can be embedded via `<div class="mermaid">...</div>` blocks (Mermaid.js is loaded site-wide).

### Images

- Place post hero backgrounds in `img/posts/` and reference them from front matter.
- The `calibreapp-image-actions` workflow will compress images automatically in PRs.

## Key Conventions

1. **Do not edit `_site/`** — it is generated output and gitignored.
2. **Do not commit `Gemfile.lock`** — it is listed in `.gitignore`.
3. **Never push directly to `gh-pages`** — it is managed by the deploy action; all source changes go to `master`.
4. **Theme origin:** `package.json` and `jekyll-theme-clean-blog.gemspec` come from the upstream Start Bootstrap theme and are kept largely unchanged. Primary customization happens in `_includes/`, `_layouts/`, `_sass/styles.scss`, and `assets/main.scss`.
5. **Styling:** Edit `_sass/styles.scss` (imported by `assets/main.scss`) rather than writing inline CSS. Sass `style: compressed` is configured in `_config.yml`.
6. **Head customizations** (analytics tags, third-party scripts, fonts) go in `_includes/head.html` or `_includes/scripts.html`.
7. **Disqus** is embedded directly in `_layouts/post.html` with the shortname `karaman-dev`.
8. **URL structure:** `baseurl: "/"` and `url: "https://karaman.dev"`. Posts are served at `/YYYY/MM/DD/slug.html` (Jekyll default); the paginated index is at `/posts/page:num/`.

## Dependencies to Keep in Mind

- **Ruby ~3.2** and **Bundler ~2.5** (matches the deploy action).
- **ImageMagick** is installed in CI by `pre_build_commands`; it may be needed locally if `jekyll-favicon` processes `favicon.jpg`.
- External CDN-loaded assets (Mermaid, Font Awesome, Google Fonts) require outbound HTTP at build time only for remote references; the site itself loads them at runtime.

## Common Tasks — Cheatsheet for AI Assistants

| Task | Where to make the change |
|---|---|
| Add a new blog post | Create `_posts/YYYY-MM-DD-slug.md` with the front matter above |
| Update site title/description | `_config.yml` |
| Add/remove Jekyll plugin | `Gemfile` (in `:jekyll_plugins` group) **and** `_config.yml` `plugins:` list |
| Tweak page header, fonts, meta tags | `_includes/head.html` |
| Change navigation links | `_includes/navbar.html` |
| Modify footer / social icons | `_includes/footer.html` |
| Update global styles | `_sass/styles.scss` (imported by `assets/main.scss`) |
| Change post layout (e.g. comments, read-time) | `_layouts/post.html` |
| Update homepage structure | `_layouts/home.html` and `index.html` |
| Change About page content | `about.md` |
| Change Contact page | `contact.html` |
| Modify CI/deploy pipeline | `.github/workflows/build-jekyll.yml` |

## Notes for AI Assistants

- Prefer minimal, surgical edits to existing files over restructuring.
- When adding Turkish content, match the tone and level of detail of existing posts in `_posts/`.
- Before committing, verify `bundle exec jekyll build` succeeds if the tooling is available in the environment; otherwise at least sanity-check front matter, YAML validity, and relative asset paths.
- Do not add new top-level files (especially `*.md` docs) unless explicitly requested.
- This repository is pinned to a single upstream repo for GitHub MCP operations: `mavrikant/mavrikant.github.io`.
